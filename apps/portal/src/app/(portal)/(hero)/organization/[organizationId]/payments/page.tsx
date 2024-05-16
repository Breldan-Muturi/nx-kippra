import { fetchPaymentsTable } from '@/actions/payments/filter.payment.actions';
import PaymentsTable from '@/app/(portal)/components/tables/payments-table/payments-table';
import {
  FetchPaymentsType,
  fetchPaymentsSchema,
} from '@/validation/payment/payment.validation';

const OrganizationPayments = async ({
  searchParams,
  params: { organizationId },
}: {
  searchParams: FetchPaymentsType;
  params: { organizationId: string };
}) => {
  const validSearch = fetchPaymentsSchema.parse(searchParams);

  const paymentsInfo = await fetchPaymentsTable(validSearch, organizationId);
  if ('error' in paymentsInfo)
    return (
      <div>{`Failed to fetch payment details due to a server error: ${paymentsInfo.error}`}</div>
    );

  return <PaymentsTable className="mt-8" {...paymentsInfo} />;
};

export default OrganizationPayments;
