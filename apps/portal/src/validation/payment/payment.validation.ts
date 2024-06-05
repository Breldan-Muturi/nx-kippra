import { z } from 'zod';
import { paginationSchema } from '../pagination.validation';
import {
  characterCount,
  email,
  validString,
  validUrl,
} from '../reusable.validation';

export const paymentDescriptionSchema = z.object({
  amountExpected:
    process.env.NODE_ENV === 'production'
      ? z
          .number()
          .int()
          .positive()
          .gte(50, 'Payment must include convenience fee')
      : z.number().positive(),
  billDesc: validString('Enter a bill description'),
  applicationId: z.string(),
});

export const payeeFormSchema = z.object({
  clientName: characterCount(
    6,
    50,
    'Full name should be between 6 and 20 characters',
  ),
  clientIDNumber: characterCount(5, 12, 'Enter a valid ID Number'),
  clientMSISDN: z
    .number()
    .int()
    .gte(254000000000, 'Enter a valid phone number')
    .lte(256999999999, 'Enter a valid phone number'),
  clientEmail: email,
  pictureURL: z.string().url().optional(),
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

export const pesaflowActionSchema = paymentFormSchema.extend({
  currency: characterCount(3, 3).default('KES'),
  serviceID: validString('Service ID should be 7 characters long', 7),
  billRefNumber: validString('Enter a valid bill reference No'),
});
export type PesaflowActionSchema = z.infer<typeof pesaflowActionSchema>;

export const pesaflowCheckoutApiSchema = pesaflowActionSchema
  .omit({
    applicationId: true,
    clientMSISDN: true,
  })
  .extend({
    secureHash: validString('Missing secureHash'),
    apiClientID: characterCount(3, 3),
    notificationURL: validUrl('The notification url is not valid'),
    callBackURLOnSuccess: validUrl('The callback url is not valid'),
    sendSTK: z.boolean().default(true),
    format: z.enum(['json', 'iframe']).default('json'),
    clientMSISDN: z
      .string()
      .refine((value) => {
        // Check if the string can be parsed as a number
        const parsedValue = parseInt(value, 10);
        return !isNaN(parsedValue);
      }, 'Enter a valid phone number')
      .refine((value) => {
        // Check if the parsed number is within the specified range
        const parsedValue = parseInt(value, 10);
        return parsedValue >= 254000000000 && parsedValue <= 256999999999;
      }, 'Enter a valid phone number'),
    // clientMSISDN: z
    //   .string()
    //   .regex(
    //     /^254[17]\d{8}$/,
    //     'Enter a valid Kenyan phone number starting with 2541 or 2547',
    //   ),
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

export const filterPaymentsSchema = z.object({
  status: z.string().optional(),
  method: z.string().optional(),
  invoiceNumber: z.string().optional(),
  programTitle: z.string().optional(),
  payeeName: z.string().optional(),
});
export type FilterPaymentsType = z.infer<typeof filterPaymentsSchema>;

export const fetchPaymentsSchema = filterPaymentsSchema
  .merge(paginationSchema)
  .extend({
    hiddenColumns: z.string().optional(),
  });
export type FetchPaymentsType = z.infer<typeof fetchPaymentsSchema>;

export const pathPaymentsSchema = fetchPaymentsSchema.extend({
  path: validString('Pass a redirect path', 1),
});
export type PathPaymentsType = z.infer<typeof pathPaymentsSchema>;
