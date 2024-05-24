'use server';

import {
  PesaflowActionSchema,
  pesaflowCheckoutApiSchema,
} from '@/validation/payment/payment.validation';
import axios from 'axios';
import { createHmac } from 'crypto';
import { ConversionUtils } from 'turbocommons-ts';

const apiClientID = process.env.PESAFLOW_CLIENT_ID as string;
const secret = process.env.PESAFLOW_API_SECRET as string;
const key = process.env.PESAFLOW_API_KEY as string;

export type PesaFlowReturn =
  | { error: string }
  | { invoiceLink: string; invoiceNumber: string };

export const pesaflowPayment = async (
  args: PesaflowActionSchema,
): Promise<PesaFlowReturn> => {
  const dataString =
    apiClientID +
    args.amountExpected +
    args.serviceID +
    args.clientIDNumber +
    args.currency +
    args.billRefNumber +
    args.billDesc +
    args.clientName +
    secret;

  const signed = createHmac('sha256', key)
    .update(Buffer.from(dataString, 'utf-8'))
    .digest();
  const secureHash = ConversionUtils.stringToBase64(signed.toString('hex'));

  const validApiData = pesaflowCheckoutApiSchema.safeParse({
    ...args,
    secureHash,
    apiClientID,
    notificationURL: `https://nxportal.sohnandsol.com/api/payments/${args.applicationId}${process.env.NODE_ENV !== 'production' ? '/dev' : ''}`,
    callBackURLOnSuccess: `${process.env.NEXT_PUBLIC_APP_URL}/applications`,
    sendSTK: true,
    format: 'json',
    clientMSISDN: String(args.clientMSISDN),
  });

  if (!validApiData.success) {
    console.error('Validation error: ', validApiData.error);
    return { error: 'Invalid payment data, please try again later' };
  }

  try {
    const axiosResponse = await axios({
      method: 'POST',
      url: process.env.PESAFLOW_URL as string,
      headers: {
        'Content-Type': 'application/json',
      },
      data: validApiData.data,
    });
    return {
      invoiceLink: axiosResponse.data.invoice_link,
      invoiceNumber: axiosResponse.data.invoice_number,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(
        'Valid api data: ',
        JSON.stringify(validApiData.data, null, 2),
      );
      console.log('Error: ', error);
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
};
