import { z } from 'zod';
import {
  characterCount,
  email,
  validString,
  validUrl,
} from '../reusable.validation';
import { paginationSchema } from '../pagination.validation';

export const paymentDescriptionSchema = z.object({
  amountExpected: z.number().positive(),
  billDesc: validString('Enter a bill description'),
  applicationId: z.string(),
});

export const payeeFormSchema = z.object({
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
export type PayeeForm = z.infer<typeof payeeFormSchema>;

export const paymentFormSchema =
  paymentDescriptionSchema.merge(payeeFormSchema);
export type PaymentForm = z.infer<typeof paymentFormSchema>;

export const applicationPaymentDetailsSchema = paymentDescriptionSchema.merge(
  payeeFormSchema.partial(),
);
export type ApplicationPaymentDetails = z.infer<
  typeof applicationPaymentDetailsSchema
>;

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

export const paymentReferenceApiSchema = z.object({
  payment_reference: z.string(),
  payment_date: z.string(),
  inserted_at: z.string(),
  currency: z.string(),
  amount: z.string(),
});

export const paymentApiResponseSchema = z.object({
  status: z.string(),
  secure_hash: z.string(),
  phone_number: z.string(),
  payment_reference: z.array(paymentReferenceApiSchema).nonempty(),
  payment_date: z.string(),
  payment_channel: z.string(),
  last_payment_amount: z.string(),
  invoice_number: z.string(),
  invoice_amount: z.string(),
  currency: z.string(),
  client_invoice_ref: z.string(),
  amount_paid: z.string(),
});

export const ipnSchema = paymentApiResponseSchema
  .omit({
    payment_reference: true,
    payment_date: true,
    last_payment_amount: true,
    invoice_amount: true,
    amount_paid: true,
  })
  .extend({
    payment_date: z.date(),
    last_payment_amount: z.number().positive(),
    invoice_amount: z.number().positive(),
    amount_paid: z.number().positive(),
  });
export type IpnType = z.infer<typeof ipnSchema>;

export const ipnReferenceSchema = paymentReferenceApiSchema
  .pick({
    payment_reference: true,
    currency: true,
  })
  .extend({
    payment_date: z.date(),
    inserted_at: z.date(),
    amount: z.number(),
  });
export type IpnReferenceType = z.infer<typeof ipnReferenceSchema>;
export const ipnReferenceArraySchema = z.array(ipnReferenceSchema).nonempty();

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

export const filterPaymentsSchema = z
  .object({
    userId: z.string(),
    hiddenColumns: z.string().optional(),
    status: z.string().optional(),
    method: z.string().optional(),
    invoiceNumber: z.string().optional(),
    programTitle: z.string().optional(),
    payeeName: z.string().optional(),
    viewPayment: z.string().optional(),
  })
  .merge(paginationSchema);
export type FilterPaymentsType = z.infer<typeof filterPaymentsSchema>;

export const filterpaymentFormSchema = filterPaymentsSchema.pick({
  status: true,
  method: true,
  invoiceNumber: true,
  programTitle: true,
  payeeName: true,
});
export type FilterPaymentFormType = z.infer<typeof filterpaymentFormSchema>;

export const paymentsSearchParamsSchema = filterPaymentsSchema.omit({
  userId: true,
});
export type PaymentsSearchParamsType = z.infer<
  typeof paymentsSearchParamsSchema
>;
export const viewPaymentsRedirectSchema = paymentsSearchParamsSchema.omit({
  viewPayment: true,
});
export type ViewPaymentsRedirectType = z.infer<
  typeof viewPaymentsRedirectSchema
>;

export const filterPaymentsRedirectSchema = filterPaymentsSchema
  .omit({ userId: true })
  .extend({
    path: validString('Pass a redirect path', 1),
  });
export type FilterPaymentsRedirectType = z.infer<
  typeof filterPaymentsRedirectSchema
>;
