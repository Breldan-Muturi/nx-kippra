'use server';

import { db } from '@/lib/db';
import {
  FilterPaymentsType,
  filterPaymentsSchema,
} from '@/validation/payment.validation';
import { Payment, Prisma, UserRole } from '@prisma/client';

export type FilterPaymentsReturnType =
  | { error: string }
  | {
      payments: Payment[];
      paymentFilters: {
        channelFilter: Payment['payment_channel'][];
        statusFilter: Payment['status'][];
        highestAmount: number;
        lowestAmount: number;
      };
    };

export const filterPayments = async (
  params: FilterPaymentsType,
): Promise<FilterPaymentsReturnType> => {
  const validParams = filterPaymentsSchema.safeParse(params);
  if (!validParams.success) {
    console.log(
      'Filter payments validation error: ',
      filterPaymentsSchema.parse(validParams),
    );
    return { error: 'Invalid request for payments' };
  }
  const { userId } = validParams.data;

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!existingUser || !existingUser.id) {
    return { error: 'Could not find a user with matching id' };
  }

  if (!existingUser.role) {
    return { error: "Could not determine this user's role" };
  }

  let userWhereCondition: Prisma.PaymentWhereInput = {};
  let filterCondition: Prisma.PaymentWhereInput = {};
  let additionalCondition = '';

  if (existingUser.role !== UserRole.ADMIN) {
    userWhereCondition = { application: { ownerId: userId } };
    additionalCondition = 'AND "application"."ownerId" = ${userId}';
  }

  const paymentsPromise = db.payment.findMany({
    where: {
      ...userWhereCondition,
      ...filterCondition,
    },
  });

  const statusFiltersPromise = db.payment.findMany({
    where: {
      ...userWhereCondition,
      AND: [{ status: { not: null } }],
    },
    select: {
      status: true,
    },
    distinct: ['status'],
  });

  const channelFiltersPromise = db.payment.findMany({
    where: {
      ...userWhereCondition,
      AND: [{ payment_channel: { not: null } }],
    },
    select: {
      payment_channel: true,
    },
    distinct: ['payment_channel'],
  });

  const highestAmountQuery = `
  SELECT MAX(CAST(amount_paid AS DECIMAL))
  FROM "Payment"
  INNER JOIN "Application" ON "Payment"."applicationId" = "Application"."id"
  WHERE amount_paid IS NOT NULL AND amount_paid != '' ${additionalCondition};
`;
  const highestAmountPromise = db.$queryRawUnsafe(highestAmountQuery, {
    userId: existingUser.id,
  });

  const lowestAmountQuery = `
  SELECT MIN(CAST(amount_paid AS DECIMAL))
  FROM "Payment"
  INNER JOIN "Application" ON "Payment"."applicationId" = "Application"."id"
  WHERE amount_paid IS NOT NULL AND amount_paid != '' ${additionalCondition};
`;
  const lowestAmountPromise = db.$queryRawUnsafe(lowestAmountQuery, {
    userId: existingUser.id,
  });

  const [
    payments,
    channelFilter,
    statusFilter,
    highestAmountResult,
    lowestAmountResult,
  ] = await Promise.all([
    paymentsPromise,
    channelFiltersPromise,
    statusFiltersPromise,
    highestAmountPromise,
    lowestAmountPromise,
  ]);

  const highestAmount = parseFloat(
    (highestAmountResult as { max: string | null }[])[0]?.max ?? '0',
  );
  const lowestAmount = parseFloat(
    (lowestAmountResult as { min: string | null }[])[0]?.min ?? '0',
  );

  return {
    payments,
    paymentFilters: {
      channelFilter: channelFilter.map((filter) => filter.payment_channel),
      statusFilter: statusFilter.map((filter) => filter.status),
      highestAmount,
      lowestAmount,
    },
  };
};
