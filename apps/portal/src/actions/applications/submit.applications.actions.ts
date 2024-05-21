'use server';
import {
  FilesUploadReturn,
  pdfsUpload,
} from '@/actions/firebase/storage.actions';
import {
  PDFResponse,
  generatePDFFromApi,
} from '@/actions/pdf/generate-pdf-api.actions';
import { ApplicationSlots } from '@/app/(portal)/components/forms/application-form/modal/application-modal';
import { formatVenues } from '@/helpers/enum.helpers';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateApplicationConfirmationToken } from '@/lib/tokens';
import {
  approvedApplicationEmail,
  newApplicationEmail,
} from '@/mail/application.mail';
import { inviteOrgTokenEmail } from '@/mail/organization.mail';
import { AdminApplicationForm } from '@/validation/applications/admin.application.validation';
import { FormApplicationParticipant } from '@/validation/applications/participants.application.validation';
import { NewOrganizationForm } from '@/validation/organization/organization.validation';
import { PayeeForm } from '@/validation/payment/payment.validation';
import {
  Application,
  ApplicationStatus,
  Delivery,
  Organization,
  OrganizationRole,
  Prisma,
  UserRole,
} from '@prisma/client';
import { format } from 'date-fns';
import { v4 } from 'uuid';
import {
  PesaFlowReturn,
  pesaflowPayment,
} from '../pesaflow/pesaflow.checkout.actions';

const getApplicationOwner = async (
  participants: FormApplicationParticipant[],
) =>
  await db.user.findFirst({
    where: { email: participants.find(({ isOwner }) => isOwner)?.email },
    select: { id: true, email: true },
  });
type ApplicationOwnerType = NonNullable<
  Awaited<ReturnType<typeof getApplicationOwner>>
>;

const createNewOrganization = async ({
  validOrganization,
  participants = [],
  orgOwnerId,
}: {
  validOrganization: NewOrganizationForm;
  participants?: FormApplicationParticipant[];
  orgOwnerId: string;
}) => {
  const {
    organizationAddress,
    organizationEmail,
    organizationPhone,
    ...orgInfo
  } = validOrganization;
  return await db.organization.create({
    data: {
      ...orgInfo,
      address: organizationAddress,
      email: organizationEmail,
      phone: organizationPhone,
      users: {
        create: {
          user: { connect: { id: orgOwnerId } },
          role: OrganizationRole.OWNER,
        },
      },
      invites: {
        createMany: {
          data: participants
            ?.filter(({ isOwner }) => !isOwner)
            .map((participant) => ({
              email: participant.email,
              expires: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              token: v4(),
            })),
          skipDuplicates: true,
        },
      },
    },
  });
};

const getSessionInformation = async ({
  trainingSessionId,
  usingUsd,
  isOnPremise,
}: {
  trainingSessionId: string;
  usingUsd: boolean;
  isOnPremise: boolean;
}) =>
  await db.trainingSession.findUnique({
    where: { id: trainingSessionId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      venue: isOnPremise ? true : undefined,
      program: {
        select: {
          serviceId: usingUsd ? undefined : true,
          serviceIdUsd: usingUsd ? true : undefined,
          title: true,
        },
      },
    },
  });
type SessionInformation = Awaited<ReturnType<typeof getSessionInformation>>;

// TODO:Confirm this actually adds the intended participants to the application
const checkExistingParticipants = async ({
  participants,
  organization,
}: {
  participants: Omit<FormApplicationParticipant, 'isOwner'>[];
  organization?: Organization;
}): Promise<
  Prisma.ApplicationParticipantUncheckedCreateWithoutApplicationInput[]
> => {
  const existingParticipants = await db.user.findMany({
    where: { email: { in: participants.map(({ email }) => email) } },
    select: { id: true, email: true },
  });
  return participants.map((participant) => {
    const matchingParticipant = existingParticipants.find(
      ({ email }) => email === participant.email,
    );
    return {
      ...participant,
      userId: matchingParticipant?.id,
      organizationId: organization?.id,
      organizationName: organization?.name || '',
      attendanceConfirmed: false,
    };
  });
};

export type SubmitAdminApplicationParams = {
  applicationForm: Pick<
    AdminApplicationForm,
    'delivery' | 'sponsorType' | 'trainingSessionId'
  >;
  validOrganization?: NewOrganizationForm;
  participants?: FormApplicationParticipant[];
  payee?: PayeeForm;
  organizationId?: string;
  applicationFee?: number;
  slots: ApplicationSlots;
  usingUsd: boolean;
};

export type SubmitAdminApplicationReturn =
  | { error: string }
  | { success: string; applicationId: string };

export const submitAdminApplication = async (
  data: SubmitAdminApplicationParams,
): Promise<SubmitAdminApplicationReturn> => {
  const user = await currentUser();
  if (!user || !user.id || !user.email)
    return { error: 'You must be logged in to submit this application' };
  const {
    validOrganization,
    participants,
    organizationId,
    applicationFee,
    applicationForm,
    usingUsd,
    payee,
    slots,
  } = data;
  const { delivery, trainingSessionId, sponsorType } = applicationForm;
  const isOnPremise = delivery !== Delivery.ONLINE;
  const isAdmin = payee && applicationFee && user.role === UserRole.ADMIN;

  let applicationOwner: ApplicationOwnerType = {
    email: user.email,
    id: user.id,
  };

  try {
    const ownerApplication =
      participants && isAdmin
        ? await getApplicationOwner(participants)
        : undefined;
    applicationOwner = !!ownerApplication ? ownerApplication : applicationOwner;
  } catch (error) {
    console.error('Error verifying account information: ', error);
    return {
      error:
        'Failed to verify account information due to a server error. Please try again later',
    };
  }

  let newOrganization: Organization | undefined,
    sessionInformation: SessionInformation;
  try {
    [newOrganization, sessionInformation] = await Promise.all([
      validOrganization
        ? createNewOrganization({
            validOrganization,
            participants,
            orgOwnerId: applicationOwner.id,
          })
        : Promise.resolve(undefined),
      getSessionInformation({ trainingSessionId, usingUsd, isOnPremise }),
    ]);
  } catch (error) {
    console.error('Error validation application details: ', error);
    return {
      error: 'Error validation application details. Please try again later',
    };
  }

  if (!sessionInformation || !sessionInformation.id)
    return {
      error:
        'Failed to get matching program due to a server error. Please try again later',
    };
  const {
    endDate,
    program: { serviceId, serviceIdUsd, title },
    startDate,
    venue,
  } = sessionInformation;

  let newApplication: Application;
  try {
    newApplication = await db.application.create({
      data: {
        delivery,
        currency: usingUsd ? 'USD' : 'KES',
        sponsorType,
        ...slots,
        ownerId: applicationOwner?.id || user.id,
        organizationId: newOrganization?.id || organizationId,
        participants: !!participants
          ? {
              create: await checkExistingParticipants({
                participants: participants.map(({ isOwner, ...rest }) => rest),
                organization: newOrganization,
              }),
            }
          : undefined,
        trainingSessionId: sessionInformation.id,
        applicationFee,
      },
    });
  } catch (error) {
    console.error('New application error: ', error);
    return {
      error:
        'There was an error submitting this application, please try again later',
    };
  }

  let applicationEmailPromise: Promise<void>[] = [],
    inviteOrgEmailsPromise: Promise<void>[] = [];
  if (participants && participants.length) {
    applicationEmailPromise = participants?.map(
      async ({ email: participantEmail }) => {
        const tokenExpiry = new Date(startDate);
        tokenExpiry.setDate(tokenExpiry.getDate() - 7);
        const { email, token, expires } =
          await generateApplicationConfirmationToken({
            email: participantEmail,
            expires: tokenExpiry,
            trainingSessionId,
          });
        return newApplicationEmail({
          email,
          endDate,
          expires,
          startDate,
          title,
          token,
        });
      },
    );
    if (!!newOrganization) {
      const invites = await db.inviteOrganization.findMany({
        where: { organizationId: newOrganization.id },
        select: { email: true, token: true },
      });
      inviteOrgEmailsPromise = invites.map(({ email, token }) => {
        const isRegistered = participants.find(
          (participant) => participant.email === email,
        )?.userId;
        return inviteOrgTokenEmail({
          to: email,
          organizationName: newOrganization!.name,
          senderName: user.name!,
          token,
          inviteRoute: !!isRegistered ? 'organizations' : 'account/register',
        });
      });
    }
  }

  let newApplicationEmailPromise: Promise<void> = Promise.resolve(undefined);
  if (isAdmin) {
    let pdfProforma: PDFResponse, pdfOffer: PDFResponse;
    try {
      [pdfProforma, pdfOffer] = await Promise.all([
        generatePDFFromApi({
          applicationId: newApplication.id,
          template: 'pro-forma-invoice',
        }),
        generatePDFFromApi({
          applicationId: newApplication.id,
          template: 'offer-letter',
        }),
      ]);
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again later' };
    }
    if ('error' in pdfProforma)
      return { error: `Could not generate the invoice:  ${pdfProforma.error}` };
    if ('error' in pdfOffer)
      return {
        error: `Could not generate the offer-letter:  ${pdfOffer.error}`,
      };

    let pdfUploads: FilesUploadReturn, pesaflow: PesaFlowReturn;
    try {
      [pdfUploads, pesaflow] = await Promise.all([
        pdfsUpload(
          [
            {
              buffer: pdfProforma.generatedPDF,
              fileName: 'proforma-invoice',
            },
            {
              buffer: pdfOffer.generatedPDF,
              fileName: 'offer-letter',
            },
          ],
          `applications/${newApplication.id}`,
        ),
        pesaflowPayment({
          amountExpected:
            process.env.NODE_ENV === 'production'
              ? usingUsd
                ? applicationFee + 1
                : applicationFee + 50
              : 1,
          applicationId: newApplication.id,
          billDesc: `Invoice for ${title} from ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')} ${isOnPremise && venue ? formatVenues(venue) : ''}`,
          billRefNumber: `${new Date().toISOString()}_${newApplication.id}_admin_initiated`,
          currency: usingUsd ? 'USD' : 'KES',
          serviceID: String(serviceId || serviceIdUsd),
          ...payee,
        }),
      ]);
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again later' };
    }
    if ('error' in pdfUploads) return { error: pdfUploads.error };
    if ('error' in pesaflow) return { error: pesaflow.error };

    const proforma = pdfUploads.find(({ filePath }) =>
      filePath.endsWith('proforma-invoice'),
    );
    const offer = pdfUploads.find(({ filePath }) =>
      filePath.endsWith('offer-letter'),
    );

    if (!proforma || !offer)
      return {
        error:
          'Failed to generate PDFs for this application due to server error. Please try again later',
      };

    try {
      await db.application.update({
        where: { id: newApplication.id },
        data: {
          status: ApplicationStatus.APPROVED,
          proformaInvoice: { create: proforma! },
          offerLetter: { create: offer! },
          invoice: {
            create: {
              invoiceEmail: applicationOwner?.email || user.email,
              invoiceLink: pesaflow.invoiceLink,
              invoiceNumber: pesaflow.invoiceNumber,
            },
          },
        },
      });
    } catch (error) {
      console.error(
        'Failed to approve the application due to a system error: ',
        error,
      );
      return {
        error:
          'Failed to approve the application due to a system error. Please try again later',
      };
    }

    newApplicationEmailPromise = approvedApplicationEmail({
      approvalDate: new Date(),
      title,
      startDate,
      endDate,
      venue: venue ? venue : undefined,
      to: [
        applicationOwner.email,
        ...(!!user.email && applicationOwner.email !== user.email
          ? [user.email]
          : []),
      ],
      proformaInvoice: {
        filename: `Proforma invoice`,
        path: proforma?.filePath!,
      },
      offerLetter: {
        filename: `Offer letter`,
        path: offer?.filePath!,
      },
    });
  }

  try {
    await Promise.all([
      applicationEmailPromise,
      inviteOrgEmailsPromise,
      newApplicationEmailPromise,
    ]);
    return {
      success:
        'Application submitted successfully, the invoice link, and application approval emails have been sent to the participants',
      applicationId: newApplication.id,
    };
  } catch (error) {
    return {
      error:
        'There was an error sending email notifications. Please try again later',
    };
  }
};
