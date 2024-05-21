'use server';
import { processSearchString } from '@/helpers/filter.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { SelectOptions } from '@/types/form-field.types';
import {
  FetchPaymentsType,
  PathPaymentsType,
  fetchPaymentsSchema,
  pathPaymentsSchema,
} from '@/validation/payment/payment.validation';
import { Prisma, UserRole } from '@prisma/client';
import filterRedirect from '../redirect.actions';

const userPromise = async (id: string) =>
  await db.user.findUnique({ where: { id }, select: { id: true, role: true } });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const selectPaymentsPromise = async (
  hiddenColumnsArray: string[],
  where: Prisma.PaymentWhereInput,
  page: string,
  pageSize: string,
) =>
  await db.payment.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select: {
      id: true,
      application: {
        select: {
          owner: {
            select: { image: { select: { fileUrl: true } }, name: true },
          },
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
export type FilteredPaymentsDetails = Awaited<
  ReturnType<typeof selectPaymentsPromise>
>;
export type SinglePaymentDetail = FilteredPaymentsDetails[number];

const countPromise = async (where: Prisma.PaymentWhereInput): Promise<number> =>
  await db.payment.count({ where });

const statusPromise = async (where: Prisma.PaymentWhereInput) =>
  await db.payment.findMany({
    where,
    select: {
      status: true,
    },
    distinct: ['status'],
  });
type StatusPromise = Awaited<ReturnType<typeof statusPromise>>;

const channelsPromise = async (where: Prisma.PaymentWhereInput) =>
  await db.payment.findMany({
    where,
    select: {
      payment_channel: true,
    },
    distinct: ['payment_channel'],
  });
type ChannelsPromise = Awaited<ReturnType<typeof channelsPromise>>;

export type FetchPaymentsReturn =
  | { error: string }
  | {
      fetchParams: FetchPaymentsType;
      payments: FilteredPaymentsDetails;
      filterChannels: SelectOptions[];
      filterStatuses: SelectOptions[];
      count: number;
    };

export type PaymentTableProps = Exclude<FetchPaymentsReturn, { error: string }>;

export const fetchPaymentsTable = async (
  fetchParams: FetchPaymentsType,
  organizationId?: string,
): Promise<FetchPaymentsReturn> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You must be logged in to view payments' };

  const validParams = fetchPaymentsSchema.safeParse(fetchParams);
  if (!validParams.success) {
    console.log(
      'Filter payments validation error: ',
      fetchPaymentsSchema.parse(validParams),
    );
    return { error: 'Invalid request for payments' };
  }

  const {
    page,
    pageSize,
    hiddenColumns,
    method,
    status,
    invoiceNumber,
    payeeName,
    programTitle,
  } = validParams.data;

  let existingUser: UserPromise;
  try {
    existingUser = await userPromise(userId);
  } catch (error) {
    console.error('Failed to authenticate user request: ', error);
    return {
      error:
        'Failed to authenticate user request due to a server error. Please try again later',
    };
  }

  if (!existingUser || !existingUser.id || !existingUser.role) {
    return {
      error:
        'Failed to authenticate this request due to a server error. Please try again later',
    };
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
    filterCondition.invoice_number = { search: searchInvoiceNumber };

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
  if (organizationId) {
    filterCondition = {
      ...filterCondition,
      application: { organizationId },
    };
  }

  const hiddenColumnsArray = hiddenColumns ? hiddenColumns.split(',') : [];

  if (existingUser.role !== UserRole.ADMIN) {
    userWhereCondition = { application: { ownerId: userId } };
  }

  let payments: SinglePaymentDetail[],
    count: number,
    statusFilter: StatusPromise,
    channelFilter: ChannelsPromise;
  try {
    [payments, count, statusFilter, channelFilter] = await Promise.all([
      selectPaymentsPromise(
        hiddenColumnsArray,
        { ...userWhereCondition, ...filterCondition },
        page,
        pageSize,
      ),
      countPromise(userWhereCondition),
      statusPromise(userWhereCondition),
      channelsPromise(userWhereCondition),
    ]);
  } catch (error) {
    console.error('Failed to fetch payments due to a server error: ', error);
    return {
      error:
        'Failed to fetch payments due to a server error. Please try again later',
    };
  }

  return {
    fetchParams,
    payments,
    filterChannels: channelFilter.map(({ payment_channel }) => ({
      value: payment_channel,
      optionLabel: payment_channel,
    })),
    filterStatuses: statusFilter.map(({ status }) => ({
      value: status,
      optionLabel: status,
    })),
    count,
  };
};

export const filterPayments = async (values: PathPaymentsType) => {
  await filterRedirect(values, pathPaymentsSchema, values.path);
};
