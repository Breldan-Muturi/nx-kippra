'use server';
import { uploadPDFile } from '@/actions/firebase/storage.actions';
import {
  PDFResponse,
  generatePDFFromApi,
} from '@/actions/pdf/generate-pdf-api.actions';
import { ApplicationSlots } from '@/app/(portal)/components/common/forms/application-form/modal/application-modal';
import { formatVenues } from '@/helpers/enum.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateApplicationConfirmationToken } from '@/lib/tokens';
import {
  approvedApplicationEmail,
  newApplicationEmail,
} from '@/mail/application.mail';
import { ActionReturnType } from '@/types/actions.types';
import { AdminApplicationForm } from '@/validation/applications/admin.application.validation';
import { AdminApplicationParticipant } from '@/validation/applications/participants.application.validation';
import { NewOrganizationForm } from '@/validation/organization/organization.validation';
import {
  PayeeForm,
  pesaflowCheckoutApiSchema,
} from '@/validation/payment/payment.validation';
import {
  Application,
  ApplicationStatus,
  Delivery,
  Organization,
  OrganizationRole,
  Prisma,
  UserRole,
} from '@prisma/client';
import axios from 'axios';
import { createHmac } from 'crypto';
import { format } from 'date-fns';
import { ConversionUtils } from 'turbocommons-ts';

const getExistingUser = async (userId: string) =>
  await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
type ExistingUser = Awaited<ReturnType<typeof getExistingUser>>;

const getApplicationOwner = async (
  participants: AdminApplicationParticipant[],
) =>
  await db.user.findFirst({
    where: { email: participants.find(({ isOwner }) => isOwner)?.email },
    select: { id: true, email: true },
  });
type ApplicationOwnerType = Awaited<ReturnType<typeof getApplicationOwner>>;

const createNewOrganization = async ({
  validOrganization,
  participants,
  applicationOwner,
}: {
  validOrganization: NewOrganizationForm;
  participants?: AdminApplicationParticipant[];
  applicationOwner?: ApplicationOwnerType;
}) =>
  await db.organization.create({
    data: {
      ...validOrganization,
      address: validOrganization.organizationAddress,
      email: validOrganization.organizationEmail,
      phone: validOrganization.organizationPhone,
      users: {
        create: participants
          ?.filter(({ userId }) => !!userId)
          .map(({ userId }) => ({
            user: { connect: { id: userId } },
            role:
              applicationOwner && applicationOwner.id === userId
                ? OrganizationRole.OWNER
                : OrganizationRole.MEMBER,
          })),
      },
      // Add the other participants as Invites in this organization
      // invites: participants
      //   ?.filter(({ userId }) => !userId)
      //   .map(({ email }) => email),
    },
  });

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

const checkExistingParticipants = async ({
  participants,
  organization,
}: {
  participants: Omit<AdminApplicationParticipant, 'isOwner'>[];
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
  participants?: AdminApplicationParticipant[];
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
  const userId = await currentUserId();
  if (!userId)
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

  let existingUser: ExistingUser,
    applicationOwner: ApplicationOwnerType | undefined;
  try {
    [existingUser, applicationOwner] = await Promise.all([
      getExistingUser(userId),
      participants
        ? getApplicationOwner(participants)
        : Promise.resolve(undefined),
    ]);
  } catch (error) {
    console.error('Error verifying account information: ', error);
    return {
      error:
        'Failed to verify account information due to a server error. Please try again later',
    };
  }
  if (!existingUser || !existingUser.id || !existingUser.email)
    return { error: 'User account not found, please try again later' };

  let newOrganization: Organization | undefined,
    sessionInformation: SessionInformation;
  try {
    [newOrganization, sessionInformation] = await Promise.all([
      validOrganization
        ? createNewOrganization({
            validOrganization,
            participants,
            applicationOwner,
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
        ownerId: applicationOwner?.id || existingUser.id,
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

  if (payee && applicationFee && existingUser.role === UserRole.ADMIN) {
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
    let pdfProformaUrl: ActionReturnType, pdfOfferUrl: ActionReturnType;
    try {
      [pdfProformaUrl, pdfOfferUrl] = await Promise.all([
        uploadPDFile(
          pdfProforma.generatedPDF,
          `${newApplication.id}-proforma-invoice`,
        ),
        uploadPDFile(pdfProforma.generatedPDF, `${newApplication.id}-offer`),
      ]);
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again later' };
    }
    if (pdfProformaUrl.error)
      return {
        error: `Could not upload the pdfProforma: ${pdfProformaUrl.error}`,
      };
    if (pdfOfferUrl.error)
      return {
        error: `Could not upload the offer-letter: ${pdfOfferUrl.error}`,
      };

    const { clientIDNumber, clientName, clientMSISD } = payee;

    const apiClientID = process.env.PESAFLOW_CLIENT_ID as string;
    const amountExpected =
      process.env.NODE_ENV === 'production'
        ? usingUsd
          ? applicationFee + 1
          : applicationFee + 50
        : 1;
    const serviceID = String(serviceId || serviceIdUsd);
    const currency = usingUsd ? 'USD' : 'KES';
    const billRefNumber = `${new Date().toISOString()}_${newApplication.id}_admin_initiated`;
    const billDesc = `Invoice for ${title} from ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')} ${isOnPremise && venue ? formatVenues(venue) : ''}`;
    const secret = process.env.PESAFLOW_API_SECRET as string;

    const dataString =
      apiClientID +
      amountExpected +
      serviceID +
      clientIDNumber +
      currency +
      billRefNumber +
      billDesc +
      clientName +
      secret;

    const key = process.env.PESAFLOW_API_KEY as string;
    const signed = createHmac('sha256', key)
      .update(Buffer.from(dataString, 'utf-8'))
      .digest();
    const secureHash = ConversionUtils.stringToBase64(signed.toString('hex'));

    const validApiData = pesaflowCheckoutApiSchema.safeParse({
      ...payee,
      secureHash,
      apiClientID,
      serviceID,
      notificationURL: `https://nxportal.sohnandsol.com/api/payments/${newApplication.id}${process.env.NODE_ENV !== 'production' ? '/dev' : ''}`,
      callBackURLOnSuccess: `${process.env.NEXT_PUBLIC_APP_URL}/applications`,
      billRefNumber,
      sendSTK: true,
      format: 'json',
      currency,
      amountExpected,
      billDesc,
      clientMSISDN: String(clientMSISD),
    });

    if (!validApiData.success) {
      console.error('Validation error: ', validApiData.error);
      return { error: 'Invalid payment data, please try again later' };
    }

    let invoiceLink: string, invoiceNumber: string;
    try {
      const axiosResponse = await axios({
        method: 'POST',
        url: process.env.PESAFLOW_URL as string,
        headers: {
          'Content-Type': 'application/json',
        },
        data: validApiData.data,
      });
      invoiceLink = axiosResponse.data.invoice_link;
      invoiceNumber = axiosResponse.data.invoice_number;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.table([
          { type: 'Error data', value: error.response?.data },
          { type: 'Error status', value: error.response?.status },
          { type: 'Error headers', value: error.response?.headers },
        ]);
        return {
          error: 'Server responded with an error. Please try again later',
        };
      } else {
        console.error('An unexpected error occurred: ', error);
        return {
          error: 'An unexpected error occurred. Please try again later',
        };
      }
    }

    try {
      await db.application.update({
        where: { id: newApplication.id },
        data: {
          status: ApplicationStatus.APPROVED,
          proformaInvoice: {
            create: {
              fileName: `${newApplication.id}-proforma-invoice`,
              filePath: pdfProformaUrl.success!,
            },
          },
          offerLetter: {
            create: {
              fileName: `${newApplication.id}-offer`,
              filePath: pdfOfferUrl.success!,
            },
          },
          invoice: {
            create: {
              invoiceEmail: applicationOwner?.email || existingUser.email,
              invoiceLink,
              invoiceNumber,
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

    const emailPromises = participants?.map(
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

    const newApplicationEmailPromise = approvedApplicationEmail({
      approvalDate: new Date(),
      title,
      startDate,
      endDate,
      venue: venue ? venue : undefined,
      applicantEmail: applicationOwner?.email || existingUser!.email,
      proformaInvoice: {
        filename: `${newApplication.id}-proforma-invoice`,
        path: pdfProformaUrl.success!,
      },
      offerLetter: {
        filename: `${newApplication.id}-offer`,
        path: pdfOfferUrl.success!,
      },
    });

    try {
      await Promise.all([
        !!emailPromises ? [...emailPromises] : [],
        newApplicationEmailPromise,
      ]);
    } catch (error) {
      return {
        error:
          'There was an error sending email notifications. Please try again later',
      };
    }
  }

  return {
    success:
      'Application submitted successfully, the invoice link, and application approval emails have been sent to the participants',
    applicationId: newApplication.id,
  };
};
