'use server';

import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export type SinglePaymentQueryType = {
  paymentId: string;
  userId: string;
};

const getPaymentDetails = async (paymentId: string) => {
  return await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      application: true,
      payment_references: true,
      paymentReceipt: true,
      _count: { select: { payment_references: true } },
    },
  });
};
export type PaymentDetailsType = NonNullable<
  Awaited<ReturnType<typeof getPaymentDetails>>
>;

export type SinglePaymentReturnType =
  | { error: string }
  | { paymentDetails: PaymentDetailsType };

export const getSinglePayment = async ({
  paymentId,
  userId,
}: SinglePaymentQueryType): Promise<SinglePaymentReturnType> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || !user.id) {
    return { error: 'Only authenticated users may view payment details' };
  }

  try {
    const paymentDetails = await getPaymentDetails(paymentId);
    if (!paymentDetails || paymentDetails === null) {
      return {
        error:
          'There was an error fetching payment details. Please try again later',
      };
    }
    if (
      paymentDetails.application.ownerId !== userId &&
      user.role !== UserRole.ADMIN
    ) {
      return {
        error: 'Only the applicant may view these details',
      };
    }
    return {
      paymentDetails,
    };
  } catch (error) {
    return { error: 'Error fetching payment details' };
  }
};
