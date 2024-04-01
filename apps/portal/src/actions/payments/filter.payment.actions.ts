'use server';

import { processAmountRange } from '@/helpers/payment.helpers';
import { db } from '@/lib/db';
import { SelectOptions } from '@/types/form-field.types';
import {
  FilterPaymentsRedirectType,
  FilterPaymentsType,
  filterPaymentsRedirectSchema,
  filterPaymentsSchema,
} from '@/validation/payment.validation';
import { Prisma, UserRole } from '@prisma/client';
import filterRedirect from '../redirect.actions';
import { processSearchString } from '@/helpers/filter.helpers';

export type FilterPaymentFieldsType = {
  channelFilter: SelectOptions[];
  statusFilter: SelectOptions[];
  highestAmount: number;
  lowestAmount: number;
  disabled: boolean;
};

export type FilterPaymentFieldsActionType = Omit<
  FilterPaymentFieldsType,
  'disabled'
>;

const selectPaymentsPromise = async (
  hiddenColumnsArray: string[],
  where: Prisma.PaymentWhereInput,
  page: string,
  pageSize: string,
) => {
  return await db.payment.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select: {
      id: true,
      application: {
        select: {
          owner: { select: { image: true, name: true } },
          organization: { select: { name: true } },
          trainingSession: {
            select: {
              program: {
                select: hiddenColumnsArray.includes('Program')
                  ? undefined
                  : { title: true, code: true },
              },
            },
          },
          invoice: {
            select: hiddenColumnsArray.includes('invoice')
              ? undefined
              : { invoiceNumber: true },
          },
        },
      },
      payment_date: hiddenColumnsArray.includes('Payment date')
        ? undefined
        : true,
      amount_paid: true,
      paymentReceipt: { select: { filePath: true } },
      currency: hiddenColumnsArray.includes('Currency') ? undefined : true,
      payment_channel: hiddenColumnsArray.includes('Method') ? undefined : true,
    },
  });
};
export type FilteredPaymentsDetails = Awaited<
  ReturnType<typeof selectPaymentsPromise>
>;
export type SinglePaymentDetail = FilteredPaymentsDetails[number];

export type FilterPaymentsReturnType =
  | { error: string }
  | {
      payments: FilteredPaymentsDetails;
      paymentFilters: FilterPaymentFieldsActionType;
      count: number;
    };

export type PaymentTableProps = {
  paymentsInfo: Exclude<FilterPaymentsReturnType, { error: string }>;
  tableParams: FilterPaymentsType;
};

export const filterPaymentsTable = async (
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
  const {
    userId,
    page,
    pageSize,
    hiddenColumns,
    method,
    status,
    invoiceNumber,
    payeeName,
    programTitle,
  } = validParams.data;

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

  if (method) filterCondition.payment_channel = method;
  if (status) filterCondition.status = status;

  const searchInvoiceNumber = invoiceNumber
    ? processSearchString(invoiceNumber)
    : undefined;
  const searchPayeeName = payeeName
    ? processSearchString(payeeName)
    : undefined;
  const searchProgramTitle = programTitle
    ? processSearchString(programTitle)
    : undefined;

  if (searchInvoiceNumber)
    filterCondition = {
      ...filterCondition,
      invoice_number: { search: searchInvoiceNumber },
    };
  if (searchPayeeName)
    filterCondition = {
      ...filterCondition,
      application: { owner: { name: { search: searchPayeeName } } },
    };
  if (searchProgramTitle)
    filterCondition = {
      ...filterCondition,
      application: {
        trainingSession: { program: { title: { search: searchProgramTitle } } },
      },
    };

  const hiddenColumnsArray = hiddenColumns ? hiddenColumns.split(',') : [];

  if (existingUser.role !== UserRole.ADMIN) {
    userWhereCondition = { application: { ownerId: userId } };
  }

  const countPromise = db.payment.count({ where: userWhereCondition });

  const statusFiltersPromise = db.payment.findMany({
    where: userWhereCondition,
    select: {
      status: true,
    },
    distinct: ['status'],
  });

  const channelFiltersPromise = db.payment.findMany({
    where: userWhereCondition,
    select: {
      payment_channel: true,
    },
    distinct: ['payment_channel'],
  });

  const highestAmountPromise = db.payment.aggregate({
    where: userWhereCondition,
    _max: {
      amount_paid: true,
    },
  });

  const lowestAmountPromise = db.payment.aggregate({
    where: userWhereCondition,
    _min: {
      amount_paid: true,
    },
  });

  const [
    payments,
    count,
    channelFilter,
    statusFilter,
    highestAmountResult,
    lowestAmountResult,
  ] = await Promise.all([
    selectPaymentsPromise(
      hiddenColumnsArray,
      { ...userWhereCondition, ...filterCondition },
      page,
      pageSize,
    ),
    countPromise,
    channelFiltersPromise,
    statusFiltersPromise,
    highestAmountPromise,
    lowestAmountPromise,
  ]);

  return {
    payments,
    paymentFilters: {
      channelFilter: channelFilter.map((filter) => ({
        value: filter.payment_channel,
        optionLabel: filter.payment_channel,
      })),
      statusFilter: statusFilter.map((filter) => ({
        value: filter.status,
        optionLabel: filter.status,
      })),
      highestAmount: processAmountRange(highestAmountResult._max?.amount_paid),
      lowestAmount: processAmountRange(lowestAmountResult._min?.amount_paid),
    },
    count,
  };
};

export const filterPayments = async (values: FilterPaymentsRedirectType) => {
  await filterRedirect(values, filterPaymentsRedirectSchema, values.path);
};
