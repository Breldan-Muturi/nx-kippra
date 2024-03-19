import { z } from "zod";
import {
  characterCount,
  email,
  validString,
  validUrl,
} from "./reusable.validation";

export const paymentFormSchema = z.object({
  amountExpected: z.number().positive(),
  billDesc: validString("Enter a bill description"),
  applicationId: z.string(),
  clientName: characterCount(
    6,
    12,
    "Full name should be between 6 and 20 characters",
  ),
  clientIDNumber: characterCount(5, 12, "Enter a valid ID Number"),
  clientMSISD: z
    .number()
    .int()
    .gte(254000000000, "Enter a valid phone number")
    .lte(254999999999, "Enter a valid phone number"),
  clientEmail: email,
  pictureURL: validUrl("Picture url is not valid").optional(),
});
export type PaymentForm = z.infer<typeof paymentFormSchema>;

export const pesaflowCheckoutSchema = z
  .object({
    apiClient: characterCount(3, 3),
    serviceId: characterCount(5, 5),
    currency: characterCount(3, 3).default("KES"),
    billRefNumber: validString("Enter a valid bill reference No"),
    callbackUrl: validUrl("The callback url is not valid"),
    notificationURL: validUrl("The notification url is not valid"),
    format: z.enum(["json", "iframe"]).default("json"),
    sendSTK: z.boolean().default(true),
    url: validUrl(),
    key: validString("Missing Pesaflow API Key"),
    secret: validString("Missing Pesaflow API Secret"),
  })
  .merge(paymentFormSchema.omit({ applicationId: true }));

export type PesaFlowCheckoutType = z.infer<typeof pesaflowCheckoutSchema>;
export type ApplicationPaymentDetails = Partial<
  Omit<PaymentForm, "applicationId" | "billDesc" | "amountExpected">
> & {
  applicationId: string;
  billDesc: string;
  amountExpected: number;
};
