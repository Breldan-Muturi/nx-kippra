'use server';

import { validateNewOrganization } from '@/actions/organization/validate.organization.actions';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  AdminApplicationForm,
  adminApplicationSchema,
} from '@/validation/applications/admin.application.validation';
import {
  NewOrganizationForm,
  newOrganizationSchema,
} from '@/validation/organization/organization.validation';

const getTrainingSession = async (trainingSessionId: string) =>
  await db.trainingSession.findUnique({
    where: { id: trainingSessionId },
    include: { program: { select: { title: true, serviceId: true } } },
  });
export type ApplicationTrainingSession = NonNullable<
  Awaited<ReturnType<typeof getTrainingSession>>
>;

export type ValidAdminApplication = {
  data: AdminApplicationForm;
  applicationTrainingSession: ApplicationTrainingSession;
  participantWarnings?: {
    name: string;
    email: string;
  }[];
  organizationError?: {
    existingOrgId: string;
    existingOrgName: string;
    errorMessage: string;
  };
  organizationSuccess?: NewOrganizationForm;
};

export type AdminApplicationReturn = { error: string } | ValidAdminApplication;
export const validateAdminApplication = async (
  data: AdminApplicationForm,
): Promise<AdminApplicationReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to submit this application' };
  const validApplicationData = adminApplicationSchema.safeParse(data);
  if (!validApplicationData.success) {
    console.error('Invalid fields: ', validApplicationData.error);
    return { error: 'Invalid fields' };
  }

  const {
    trainingSessionId,
    participants,
    isExistingOrganization,
    name,
    organizationPhone,
    organizationEmail,
  } = validApplicationData.data;

  const newOrganization = isExistingOrganization
    ? undefined
    : newOrganizationSchema.parse(validApplicationData.data);

  const [applicationTrainingSession, participantsExist, newOrganizationExist] =
    await Promise.all([
      getTrainingSession(trainingSessionId),
      db.applicationParticipant.findMany({
        where: {
          AND: [
            { email: { in: participants?.map(({ email }) => email) } },
            { application: { trainingSessionId } },
          ],
        },
        select: {
          email: true,
          name: true,
          application: { select: { status: true } },
        },
      }),
      newOrganization
        ? db.organization.findFirst({
            where: {
              OR: [
                { name },
                { phone: organizationPhone },
                { email: organizationEmail },
              ],
            },
            select: { id: true, name: true, email: true, phone: true },
          })
        : Promise.resolve(undefined),
    ]);

  if (
    !applicationTrainingSession ||
    !applicationTrainingSession.id ||
    !applicationTrainingSession.startDate ||
    !applicationTrainingSession.endDate
  )
    return { error: 'Training session not found, please try again later' };
  if (!applicationTrainingSession.program.title)
    return {
      error: 'Training session program not found. Please try again later',
    };

  let participantWarnings:
    | ValidAdminApplication['participantWarnings']
    | undefined;
  if (participantsExist && participantsExist.length > 0) {
    participantWarnings = participantsExist.map(
      ({ email: applicantEmail, name: applicantName }) => {
        const matchingParticipant = participants?.find(
          ({ email: participantEmail }) => participantEmail === applicantEmail,
        );
        if (matchingParticipant) {
          const { email, name } = matchingParticipant;
          const matchingNames = name === applicantName;
          return {
            name: matchingNames ? name : `${name} as ${applicantName}`,
            email: applicantEmail,
          };
        }
        return {
          name: applicantName,
          email: applicantEmail,
        };
      },
    );

    if (participantWarnings.length === 0) participantWarnings = undefined;
  }

  let organizationError: ValidAdminApplication['organizationError'] | undefined;
  let organizationSuccess: NewOrganizationForm | undefined;
  if (newOrganizationExist) {
    organizationError = {
      existingOrgId: newOrganizationExist.id,
      existingOrgName: newOrganizationExist.name,
      errorMessage: '',
    };
    if (name === newOrganizationExist.name) {
      organizationError.errorMessage += 'name, ';
    }
    if (organizationPhone === newOrganizationExist.phone) {
      organizationError.errorMessage += 'phone number, ';
    }
    if (organizationEmail === newOrganizationExist.email) {
      organizationError.errorMessage += 'email, ';
    }
    if (organizationError.errorMessage) {
      organizationError.errorMessage = `An organization with a similar ${organizationError.errorMessage.slice(0, -2)} exists`;
    } else {
      organizationError = undefined;
      organizationSuccess = newOrganization;
    }
  }

  return {
    data,
    applicationTrainingSession,
    participantWarnings,
    organizationError,
    organizationSuccess,
  };
};
