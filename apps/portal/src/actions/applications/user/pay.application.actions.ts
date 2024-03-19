import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
// import { env } from "@/validation/env.validation";
import {
  ApplicationPaymentDetails,
  PaymentForm,
  PesaFlowCheckoutType,
  paymentFormSchema,
} from "@/validation/payment.validation";
import { Delivery } from "@prisma/client";
import { format } from "date-fns";

export type PayApplicationReturnType =
  | { error: string }
  | { paymentDetails: ApplicationPaymentDetails };

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
    return { error: "This application no-longer exists" };
  } else if (
    !existingApplication.owner.id ||
    existingApplication.owner.id !== userId
  ) {
    return {
      error:
        "You are not the owner of this application and can therefore not initiate a payment on it",
    };
  } else {
    const {
      id,
      applicationFee,
      delivery,
      owner: { email, name, nationalId, phoneNumber, image },
      trainingSession: {
        startDate,
        endDate,
        venue,
        program: { title },
      },
    } = existingApplication;
    const billDesc = `Payment for ${title} from ${format(startDate, "PPP")}, to ${format(endDate, "PPP")} ${delivery === Delivery.ON_PREMISE && venue ? `to be held at ${venue}` : ""}`;
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
    };
  }
};

export const initiatePayment = async (paymentForm: PaymentForm) => {
  const user = await currentUser();
  if (!user || !user.id) {
    return { error: "Only logged in users can initiate payments" };
  }

  const validPayment = paymentFormSchema.safeParse(paymentForm);

  if (!validPayment.success) {
    return { error: "Invalid fields" };
  }

  const { applicationId, ...paymentDetails } = validPayment.data;

  const paymentApplication = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
    },
  });

  if (!paymentApplication || !paymentApplication.id) {
    return {
      error: "Could not match this payment with an existing application",
    };
  }

  const billRefNumber = `${new Date().toISOString()}_${applicationId}`;

  const pesaflowCheckout: PesaFlowCheckoutType = {
    apiClient: process.env.PESAFLOW_CLIENT_ID as string,
    serviceId: process.env.PESAFLOW_SERVICE_ID as string,
    currency: "KES",
    billRefNumber,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments` as string,
    notificationURL:
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/${applicationId}` as string,
    format: "json",
    sendSTK: true,
    url: "",
    key: process.env.PESAFLOW_API_KEY as string,
    secret: process.env.PESAFLOW_API_SECRET as string,
    ...paymentDetails,
  };
};
