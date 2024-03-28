import { filterPayments } from '@/actions/payments/filter.payment.actions';
import { currentUserId } from '@/lib/auth';
import { FilterPaymentsType } from '@/validation/payment.validation';
import { redirect } from 'next/navigation';
import React from 'react';

const Payments = async () => {
  const userId = await currentUserId();
  if (!userId) {
    return redirect('/account');
  }
  const filterPaymentsParams: FilterPaymentsType = {
    userId,
  };

  const [paymentsPromise] = await Promise.allSettled([
    filterPayments(filterPaymentsParams),
  ]);

  if (
    paymentsPromise.status !== 'fulfilled' ||
    'error' in paymentsPromise.value
  ) {
    return (
      <div>{`There was an error fetching payments ${paymentsPromise.status === 'fulfilled' ? paymentsPromise.value : ''}`}</div>
    );
  }

  const payments = paymentsPromise.value.payments;
  const paymentFilters = paymentsPromise.value.paymentFilters;

  return (
    <div className="flex flex-col p-4 w-[800px]">
      <p className="text-green-600 font-semibold">Payment Filters</p>
      <p>{JSON.stringify(paymentFilters)}</p>
      <p className="text-green-600 font-semibold">Payments</p>
      <p>{JSON.stringify(payments)}</p>
    </div>
  );
};

export default Payments;
