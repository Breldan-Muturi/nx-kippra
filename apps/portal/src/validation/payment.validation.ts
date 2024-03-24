import { z } from 'zod';
import {
  characterCount,
  email,
  validString,
  validUrl,
} from './reusable.validation';

export const paymentFormSchema = z.object({
  amountExpected: z.number().positive(),
  billDesc: validString('Enter a bill description'),
  applicationId: z.string(),
  clientName: characterCount(
    6,
    24,
    'Full name should be between 6 and 20 characters',
  ),
  clientIDNumber: characterCount(5, 12, 'Enter a valid ID Number'),
  clientMSISD: z
    .number()
    .int()
    .gte(254000000000, 'Enter a valid phone number')
    .lte(254999999999, 'Enter a valid phone number'),
  clientEmail: email,
  pictureURL: validUrl('Picture url is not valid').optional(),
});
export type PaymentForm = z.infer<typeof paymentFormSchema>;
export type ApplicationPaymentDetails = Partial<
  Omit<PaymentForm, 'applicationId' | 'billDesc' | 'amountExpected'>
> & {
  applicationId: string;
  billDesc: string;
  amountExpected: number;
};

export const pesaflowCheckoutSchema = z
  .object({
    apiClient: characterCount(3, 3),
    serviceId: characterCount(5, 5),
    currency: characterCount(3, 3).default('KES'),
    billRefNumber: validString('Enter a valid bill reference No'),
    callbackUrl: validUrl('The callback url is not valid'),
    notificationURL: validUrl('The notification url is not valid'),
    format: z.enum(['json', 'iframe']).default('json'),
    sendSTK: z.boolean().default(true),
    url: validUrl(),
    key: validString('Missing Pesaflow API Key'),
    secret: validString('Missing Pesaflow API Secret'),
  })
  .merge(paymentFormSchema.omit({ applicationId: true }));
export type PesaFlowCheckoutType = z.infer<typeof pesaflowCheckoutSchema>;

export const pesaflowCheckoutApiSchema = z.object({
  secureHash: validString('Missing secureHash'),
  apiClientID: characterCount(3, 3),
  serviceID: validString('Should be at least 5 digits', 5),
  notificationURL: validUrl('The notification url is not valid'),
  callBackURLOnSuccess: validUrl('The callback url is not valid'),
  billRefNumber: validString('Enter a valid bill reference No'),
  sendSTK: z.boolean().default(true),
  pictureURL: z.string().url().optional(),
  format: z.enum(['json', 'iframe']).default('json'),
  currency: characterCount(3, 3).default('KES'),
  amountExpected:
    process.env.NODE_ENV === 'production'
      ? z
          .number()
          .int()
          .positive()
          .gte(50, 'Payment must include convenience fee')
      : z.number().positive(),
  billDesc: validString('Enter a bill description'),
  clientMSISDN: z
    .number()
    .int()
    .gte(254000000000, 'Enter a valid phone number')
    .lte(254999999999, 'Enter a valid phone number'),
  clientIDNumber: characterCount(5, 12, 'Enter a valid ID Number'),
  clientEmail: email,
  clientName: z.string(),
});
export type PesaFlowCheckoutApiType = z.infer<typeof pesaflowCheckoutApiSchema>;

export const ipnSchema = z.object({
  payment_channel: z.string(),
  client_invoice_ref: z.string(),
  currency: z.string(),
  amount_paid: z.string(),
  invoice_amount: z.string(),
  status: z.string(),
  invoice_number: z.string(),
  payment_date: z.string(),
  secure_hash: z.string(),
  last_payment_amount: z.string(),
});
export type IpnType = z.infer<typeof ipnSchema>;

export const pesaflowInvoiceSchema = z.object({
  body: z.object({
    invoice_number: z.string(),
    invoice_link: z.string(),
  }),
  error: z.object({
    status_code: z.number(),
    status_message: z.string(),
    body: z.string(),
  }),
  returned_an_error: z.boolean(),
});
export type PesaflowInvoiceType = z.infer<typeof pesaflowInvoiceSchema>;
