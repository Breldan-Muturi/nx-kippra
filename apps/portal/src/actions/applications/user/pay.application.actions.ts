'use server';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';

import { ApplicationPaymentDetails } from '@/validation/payment/payment.validation';
import { Delivery, InvoiceStatus } from '@prisma/client';
import { format } from 'date-fns';

const applicationPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      applicationFee: true,
      currency: true,
      delivery: true,
      invoice: {
        where: { invoiceStatus: InvoiceStatus.PENDING },
        select: {
          invoiceEmail: true,
          invoiceNumber: true,
          invoiceLink: true,
          createdAt: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          nationalId: true,
          email: true,
          phoneNumber: true,
          image: true,
        },
      },
      trainingSession: {
        select: {
          startDate: true,
          endDate: true,
          venue: true,
          program: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
type ApplicationPromise = Awaited<ReturnType<typeof applicationPromise>>;

export type PayeeApplicationModal = {
  paymentDetails: ApplicationPaymentDetails;
  existingInvoices?: {
    invoiceNumber: string;
    invoiceEmail: string;
    invoiceLink: string;
    createdAt: Date;
  }[];
  currency: string;
};

export const getPaymentApplicationPromise = async (
  id: string,
): Promise<{ error: string } | PayeeApplicationModal> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to submit this application' };
  let existingApplication: ApplicationPromise;
  try {
    existingApplication = await applicationPromise(id);
  } catch (e) {
    console.error(
      'Failed to fetch application details due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch application details due to a server error. Please try again later',
    };
  }

  if (!existingApplication) {
    return { error: 'This application no-longer exists' };
  } else if (
    !existingApplication.owner.id ||
    existingApplication.owner.id !== userId
  ) {
    return {
      error:
        'You are not the owner of this application and can therefore not initiate a payment on it',
    };
  } else if (!existingApplication.currency) {
    return {
      error: "The currency for this application's payment has not been set.",
    };
  } else if (!existingApplication.applicationFee) {
    return {
      error: 'An application fee has not been added.',
    };
  } else {
    const {
      id,
      applicationFee,
      delivery,
      currency,
      owner: { email, name, nationalId, phoneNumber, image },
      invoice,
      trainingSession: {
        startDate,
        endDate,
        venue,
        program: { title },
      },
    } = existingApplication;
    const billDesc = `Invoice for ${title} from ${format(startDate, 'PPP')}, to ${format(endDate, 'PPP')} ${delivery === Delivery.ON_PREMISE && venue ? `to be held at ${venue}` : ''}`;

    return {
      paymentDetails: {
        applicationId: id,
        amountExpected: applicationFee,
        billDesc,
        clientEmail: email || undefined,
        clientIDNumber: nationalId || undefined,
        clientMSISDN: phoneNumber ? parseInt(phoneNumber) : undefined,
        clientName: name || undefined,
        pictureURL: image || undefined,
      },
      existingInvoices: invoice,
      currency,
    };
  }
};
