import { filterPaymentsTable } from '@/actions/payments/filter.payment.actions';
import { currentUserId } from '@/lib/auth';
import {
  FilterPaymentsType,
  PaymentsSearchParamsType,
  ViewPaymentsRedirectType,
  filterPaymentsSchema,
  viewPaymentsRedirectSchema,
} from '@/validation/payment.validation';
import { redirect } from 'next/navigation';
import React from 'react';
import PaymentsTable from './components/payments-table';
import { getSinglePayment } from '@/actions/payments/single.payment.actions';
import PaymentSheetView from './components/sheets/payment-sheet-view';

const Payments = async ({
  searchParams,
}: {
  searchParams: PaymentsSearchParamsType;
}) => {
  const userId = await currentUserId();
  if (!userId) {
    return redirect('/account');
  }
  const filterPaymentsParams: FilterPaymentsType = filterPaymentsSchema.parse({
    userId,
    ...searchParams,
  });

  const viewParams: ViewPaymentsRedirectType =
    viewPaymentsRedirectSchema.parse(searchParams);

  const paymentId = filterPaymentsParams.viewPayment;

  const [paymentsPromise, singlePaymentPromise] = await Promise.allSettled([
    filterPaymentsTable(filterPaymentsParams),
    paymentId ? getSinglePayment({ userId, paymentId }) : Promise.resolve(null),
  ]);

  if (
    paymentsPromise.status !== 'fulfilled' ||
    'error' in paymentsPromise.value
  ) {
    return (
      <div>{`There was an error fetching payments ${paymentsPromise.status === 'fulfilled' ? paymentsPromise.value : ''}`}</div>
    );
  }

  const paymentDetailsInfo =
    singlePaymentPromise.status === 'fulfilled'
      ? singlePaymentPromise.value
      : null;

  return (
    <>
      <PaymentsTable
        paymentsInfo={paymentsPromise.value}
        tableParams={filterPaymentsParams}
      />
      {paymentDetailsInfo && (
        <PaymentSheetView
          payment={paymentDetailsInfo}
          viewParams={viewParams}
        />
      )}
    </>
  );
};

export default Payments;
