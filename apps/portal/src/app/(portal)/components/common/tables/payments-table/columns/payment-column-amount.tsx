import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';

const paymentAmountColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'amount',
  header: 'Amount',
  cell: ({ row }) => (
    <p className="font-semibold text-black">
      {row.original.amount_paid.toLocaleString('en-US')}
    </p>
  ),
  enableHiding: false,
};

export default paymentAmountColumn;
