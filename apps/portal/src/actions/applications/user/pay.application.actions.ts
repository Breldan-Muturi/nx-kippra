import { db } from '@/lib/db';

import { ApplicationPaymentDetails } from '@/validation/payment/payment.validation';
import { Delivery, InvoiceStatus } from '@prisma/client';
import { format } from 'date-fns';

export type PayApplicationReturnType =
  | { error: string }
  | {
      paymentDetails: ApplicationPaymentDetails;
      existingInvoices?: {
        invoiceNumber: string;
        invoiceEmail: string;
        invoiceLink: string;
        createdAt: Date;
      }[];
    };

export const getPaymentApplicationPromise = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<PayApplicationReturnType> => {
  const existingApplication = await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      applicationFee: true,
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
  } else {
    const {
      id,
      applicationFee,
      delivery,
      owner: { email, name, nationalId, phoneNumber, image },
      invoice,
      trainingSession: {
        startDate,
        endDate,
        venue,
        program: { title },
      },
    } = existingApplication;
    const billDesc = `Payment for ${title} from ${format(startDate, 'PPP')}, to ${format(endDate, 'PPP')} ${delivery === Delivery.ON_PREMISE && venue ? `to be held at ${venue}` : ''}`;

    return {
      paymentDetails: {
        applicationId: id,
        amountExpected: applicationFee,
        billDesc,
        clientEmail: email || undefined,
        clientIDNumber: nationalId || undefined,
        clientMSISD: phoneNumber ? parseInt(phoneNumber) : undefined,
        clientName: name || undefined,
        pictureURL: image || undefined,
      },
      existingInvoices: invoice,
    };
  }
};
