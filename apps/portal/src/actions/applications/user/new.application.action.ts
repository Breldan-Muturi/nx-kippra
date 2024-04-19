'use server';

import { db } from '@/lib/db';
import { generateApplicationConfirmationToken } from '@/lib/tokens';
import { newApplicationEmail } from '@/mail/application.mail';
import { ActionReturnType } from '@/types/actions.types';
import { ValidatedApplicationForm } from '@/validation/applications/user.application.validation';
import { newOrganizationSchema } from '@/validation/organization/organization.validation';
import { OrganizationRole, Prisma, SponsorType } from '@prisma/client';

type NewApplicationReturnType = ActionReturnType & {
  applicationId?: string;
};

export const userNewApplication = async (
  data: ValidatedApplicationForm,
): Promise<NewApplicationReturnType> => {
  const {
    organizationId,
    delivery,
    sponsorType,
    trainingSessionId,
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
    applicationParticipants: participants,
    newOrganization,
    userId,
    participantEmails,
    trainingFee: applicationFee,
    trainingSessionStartDate,
    trainingSessionEndDate,
    programTitle,
  } = data;

  console.log('Verifying user...');
  const existingUserId = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUserId || !existingUserId.id) {
    return { error: 'This user does not exist.' };
  }

  // Utility for creating organization applications
  const setOrganizationApplication = (
    confirmedOrganizationId: string,
  ): Prisma.ApplicationCreateInput => ({
    delivery,
    sponsorType,
    trainingSession: { connect: { id: trainingSessionId } },
    organization: { connect: { id: confirmedOrganizationId } },
    applicationFee,
    participants,
    owner: { connect: { id: existingUserId.id } },
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
  });

  let applicationId: string = '';

  // Creating a self sponsored application
  if (sponsorType === SponsorType.SELF_SPONSORED) {
    console.log('Creating self sponsored application...');
    const selfSponsoredApplication = await db.application.create({
      data: {
        delivery,
        participants,
        trainingSessionId,
        sponsorType,
        applicationFee,
        ownerId: existingUserId.id,
        slotsCitizen,
        slotsEastAfrican,
        slotsGlobal,
      },
    });
    console.log('Self sponsored application Id: ', selfSponsoredApplication.id);
    if (selfSponsoredApplication) {
      applicationId = selfSponsoredApplication.id;
    } else return { error: 'Error with creating self sponsored application' };
  }

  // Creating an existing organization application
  if (organizationId) {
    console.log('Creating existing organization sponsored application...');
    const existingOrganizationApplication = await db.application.create({
      data: setOrganizationApplication(organizationId),
    });
    console.log(
      'Existing organization application Id: ',
      existingOrganizationApplication.id,
    );
    // Consider returning the name of the organization
    if (existingOrganizationApplication) {
      applicationId = existingOrganizationApplication.id;
    } else {
      return { error: 'Error creating existing organization application' };
    }
  }

  // Creating a new organization application
  if (newOrganization) {
    const validOrganization = newOrganizationSchema.safeParse(newOrganization);
    if (!validOrganization.success) {
      return { error: 'Invalid organization fields' };
    }
    const {
      name,
      organizationAddress: address,
      organizationEmail: email,
      organizationPhone: phone,
      county,
      contactPersonEmail,
      contactPersonName,
    } = validOrganization.data;

    try {
      const newOrganizationApplicationId = await db.$transaction(
        async (prisma) => {
          const createOrganization = await prisma.organization.create({
            data: {
              name,
              address,
              contactPersonName,
              contactPersonEmail,
              county,
              email,
              phone,
              users: {
                create: {
                  role: OrganizationRole.OWNER,
                  userId: existingUserId.id,
                },
              },
            },
          });
          if (createOrganization.id) {
            const createOrganizationApplication =
              await prisma.application.create({
                data: setOrganizationApplication(createOrganization.id),
              });
            return createOrganizationApplication.id;
          }
        },
        { maxWait: 500000, timeout: 500000 },
      );
      if (newOrganizationApplicationId) {
        applicationId = newOrganizationApplicationId;
      }
    } catch (error) {
      console.log('Transaction error: ', error);
      return {
        error:
          'There was an issue creating an application with a new organization',
      };
    }
  }

  // Sending emails to participants
  const emailPromises = participantEmails.map(async (participantEmail) => {
    console.log('Sending emails...');
    const tokenExpiry = new Date(trainingSessionStartDate);
    tokenExpiry.setDate(tokenExpiry.getDate() - 7);

    const { email, token, expires } =
      await generateApplicationConfirmationToken({
        email: participantEmail,
        expires: tokenExpiry,
        trainingSessionId,
      });

    console.log('Application, emails sent');
    return newApplicationEmail({
      email,
      endDate: trainingSessionEndDate,
      expires,
      startDate: trainingSessionStartDate,
      title: programTitle,
      token,
    });
  });

  const emailsSent = await Promise.all(emailPromises);
  if (emailsSent && applicationId) {
    return {
      success: 'Application created successfully',
      applicationId,
    };
  } else {
    return {
      error: 'Error with creating applications',
    };
  }
};
