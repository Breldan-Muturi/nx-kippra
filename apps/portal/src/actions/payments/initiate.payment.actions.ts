'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  PaymentForm,
  paymentFormSchema,
} from '@/validation/payment/payment.validation';
import { ApplicationStatus } from '@prisma/client';
import { pesaflowPayment } from '../pesaflow/pesaflow.checkout.actions';

const applicationPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      trainingSession: {
        select: {
          program: { select: { serviceId: true, serviceIdUsd: true } },
        },
      },
      invoice: { select: { id: true } },
      status: true,
      currency: true,
      applicationFee: true,
    },
  });
type ApplicationPromise = Awaited<ReturnType<typeof applicationPromise>>;

export type InitiatePaymentReturn =
  | { error: string }
  | { success: string; invoiceLink: string };

export const initiatePayment = async (
  paymentForm: PaymentForm,
): Promise<InitiatePaymentReturn> => {
  const user = await currentUser();
  if (!user || !user.id) {
    return { error: 'Only logged in users can initiate payments' };
  }

  const validPayment = paymentFormSchema.safeParse(paymentForm);

  if (!validPayment.success) {
    return { error: 'Invalid fields' };
  }

  const { applicationId, billDesc } = validPayment.data;

  let paymentApplication: ApplicationPromise;
  try {
    paymentApplication = await applicationPromise(applicationId);
  } catch (e) {
    console.error('Failed to fetch application due to server error:', e);
    return {
      error:
        'Failed to fetch application due to a server error please try again later',
    };
  }

  if (!paymentApplication || !paymentApplication.id)
    return {
      error: 'Could not match this payment with an existing application',
    };
  if (!paymentApplication.currency)
    return {
      error: 'The currency for this application has not been set',
    };
  if (!paymentApplication.applicationFee)
    return {
      error: 'The application fee for this application has not been set',
    };
  if (paymentApplication.status === ApplicationStatus.COMPLETED)
    return {
      error: 'Payment for this application is already settled',
    };

  const {
    id,
    currency,
    trainingSession: {
      program: { serviceId, serviceIdUsd },
    },
    applicationFee,
  } = paymentApplication;
  const usingUsd = currency === 'USD';
  const applicationServiceId = usingUsd ? serviceIdUsd : serviceId;

  if (!applicationServiceId) {
    return {
      error:
        'This application could not be completed because the program is not live on eCitizen',
    };
  }

  const pesaflow = await pesaflowPayment({
    ...validPayment.data,
    amountExpected:
      process.env.NODE_ENV === 'production'
        ? usingUsd
          ? applicationFee + 1
          : applicationFee + 50
        : 1,
    applicationId: id,
    billDesc,
    billRefNumber: `${new Date().toISOString()}_${applicationId}_${paymentApplication.invoice.length}`,
    serviceID: String(applicationServiceId),
    currency: currency,
  });

  if ('error' in pesaflow) return { error: pesaflow.error };

  return {
    success:
      'Your payment details have been recorded successfully, proceed to complete the payment on eCitizen pesaflow',
    invoiceLink: pesaflow.invoiceLink,
  };
};
