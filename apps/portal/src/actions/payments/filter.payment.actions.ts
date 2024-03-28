'use server';

import { processAmountRange } from '@/helpers/payment.helpers';
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

  if (existingUser.role !== UserRole.ADMIN) {
    userWhereCondition = { application: { ownerId: userId } };
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

  const highestAmountPromise = db.payment.aggregate({
    where: {
      ...userWhereCondition,
      AND: [{ amount_paid: { not: null } }],
    },
    _max: {
      amount_paid: true,
    },
  });

  const lowestAmountPromise = db.payment.aggregate({
    where: {
      ...userWhereCondition,
      AND: [{ amount_paid: { not: null } }],
    },
    _min: {
      amount_paid: true,
    },
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

  return {
    payments,
    paymentFilters: {
      channelFilter: channelFilter.map((filter) => filter.payment_channel),
      statusFilter: statusFilter.map((filter) => filter.status),
      highestAmount: processAmountRange(highestAmountResult._max.amount_paid),
      lowestAmount: processAmountRange(lowestAmountResult._min.amount_paid),
    },
  };
};
