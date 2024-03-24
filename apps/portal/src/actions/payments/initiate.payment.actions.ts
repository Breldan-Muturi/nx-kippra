'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  PaymentForm,
  PesaFlowCheckoutApiType,
  PesaFlowCheckoutType,
  paymentFormSchema,
  pesaflowCheckoutApiSchema,
} from '@/validation/payment.validation';
import { createHmac } from 'crypto';
import axios from 'axios';
import { ConversionUtils } from 'turbocommons-ts';
import { Payment } from '@prisma/client';

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

  const { applicationId, amountExpected, ...paymentDetails } =
    validPayment.data;

  const paymentApplication = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      trainingSession: { select: { program: { select: { serviceId: true } } } },
      payment: { select: { id: true, status: true } },
    },
  });

  const applicationServiceId =
    paymentApplication?.trainingSession.program.serviceId;

  if (!paymentApplication || !paymentApplication.id) {
    return {
      error: 'Could not match this payment with an existing application',
    };
  }

  if (!applicationServiceId) {
    return {
      error:
        'This application could not be completed because the program is not live on eCitizen',
    };
  }

  if (paymentApplication.payment?.status === 'settled') {
    return {
      error: 'Payment for this application is already settled',
    };
  }

  const billRefNumber = `${new Date().toISOString()}_${applicationId}`;

  // Set the data to be passed to PesaFlow
  const pesaflowCheckout: PesaFlowCheckoutType = {
    apiClient: process.env.PESAFLOW_CLIENT_ID as string,
    serviceId: String(applicationServiceId),
    currency: 'KES',
    billRefNumber,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/applications`,
    notificationURL: `https://nxportal.sohnandsol.com/api/payments/${applicationId}${process.env.NODE_ENV !== 'production' ? '/dev' : ''}`,
    format: 'json',
    sendSTK: true,
    url: process.env.PESAFLOW_URL as string,
    key: process.env.PESAFLOW_API_KEY as string,
    secret: process.env.PESAFLOW_API_SECRET as string,
    amountExpected:
      process.env.NODE_ENV === 'production' ? amountExpected + 50 : 1,
    ...paymentDetails,
  };

  // Create the PesaFlow dataString
  const dataString =
    pesaflowCheckout.apiClient +
    pesaflowCheckout.amountExpected +
    pesaflowCheckout.serviceId +
    pesaflowCheckout.clientIDNumber +
    pesaflowCheckout.currency +
    pesaflowCheckout.billRefNumber +
    pesaflowCheckout.billDesc +
    pesaflowCheckout.clientName +
    pesaflowCheckout.secret;

  const signed = createHmac('sha256', pesaflowCheckout.key)
    .update(Buffer.from(dataString, 'utf-8'))
    .digest();
  const secureHash = ConversionUtils.stringToBase64(signed.toString('hex'));

  const pesaflowData: PesaFlowCheckoutApiType = {
    secureHash,
    apiClientID: pesaflowCheckout.apiClient,
    serviceID: pesaflowCheckout.serviceId,
    notificationURL: pesaflowCheckout.notificationURL,
    callBackURLOnSuccess: pesaflowCheckout.callbackUrl,
    billRefNumber: pesaflowCheckout.billRefNumber,
    sendSTK: pesaflowCheckout.sendSTK,
    pictureURL: pesaflowCheckout.pictureURL,
    format: pesaflowCheckout.format,
    currency: pesaflowCheckout.currency,
    amountExpected: pesaflowCheckout.amountExpected,
    billDesc: pesaflowCheckout.billDesc,
    clientMSISDN: pesaflowCheckout.clientMSISD,
    clientIDNumber: pesaflowCheckout.clientIDNumber,
    clientEmail: pesaflowCheckout.clientEmail,
    clientName: pesaflowCheckout.clientName,
  };

  const validApiData = pesaflowCheckoutApiSchema.safeParse(pesaflowData);

  if (!validApiData.success) {
    console.log('Payment error: ', validApiData.error);
    return { error: 'Invalid payment data, please try again' };
  }

  const { clientMSISDN, ...pesaflowPayment } = validApiData.data;
  const formatedMSISDN = String(clientMSISDN);
  const payPesaflow = {
    clientMSISDN: formatedMSISDN,
    ...pesaflowPayment,
  };

  try {
    // Axios POST request
    const axiosResponse = await axios({
      method: 'POST',
      url: pesaflowCheckout.url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payPesaflow,
    });

    console.log('Axios response data:', axiosResponse.data);

    const invoiceData = axiosResponse.data;

    let payment: Payment | undefined;

    if (paymentApplication.payment?.id) {
      payment = await db.payment.update({
        where: { id: paymentApplication.payment.id },
        data: {
          invoice_link: invoiceData.invoice_link,
          invoice_number: invoiceData.invoice_number,
        },
      });
    } else {
      payment = await db.payment.create({
        data: {
          application: { connect: { id: applicationId } },
          returned_an_error: false, // Or any other logic to determine this
          invoice_link: invoiceData.invoice_link,
          invoice_number: invoiceData.invoice_number,
        },
      });
    }

    if (!payment || !payment.id || !payment.invoice_link) {
      return { error: 'Error with recording your payment details' };
    }

    return {
      success:
        'Your payment details have been recorded successfully, proceed to complete the payment on eCitizen pesaflow',
      invoiceLink: payment.invoice_link,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Now we can safely access error.response because we've asserted the type
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      return {
        error: `Server responded with error: ${error.response?.data.message || error.response?.data || 'Unknown error'}`,
      };
    } else {
      // Error was not from Axios, handle accordingly
      console.error('An unexpected error occurred:', error);
      return { error: 'An unexpected error occurred.' };
    }
  }
};
