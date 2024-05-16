import { fetchPaymentsTable } from '@/actions/payments/filter.payment.actions';
import {
  FetchPaymentsType,
  fetchPaymentsSchema,
} from '@/validation/payment/payment.validation';
import PaymentsTable from '../../components/tables/payments-table/payments-table';

const Payments = async ({
  searchParams,
}: {
  searchParams: FetchPaymentsType;
}) => {
  const validSearch = fetchPaymentsSchema.parse(searchParams);

  const paymentsInfo = await fetchPaymentsTable(validSearch);
  if ('error' in paymentsInfo)
    return (
      <div>{`Failed to fetch payment details due to a server error: ${paymentsInfo.error}`}</div>
    );

  return <PaymentsTable {...paymentsInfo} />;
};

export default Payments;
