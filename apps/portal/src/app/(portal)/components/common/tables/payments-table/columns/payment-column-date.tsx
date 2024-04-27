import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const paymentDateColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'Payment date',
  header: 'Payment date',
  cell: ({ row }) => (
    <div className="flex flex-col">
      <p className="font-semibold text-green-600">
        {format(row.original.payment_date, 'PPP')}
      </p>
      <p>{format(row.original.payment_date, 'p')}</p>
    </div>
  ),
};

export default paymentDateColumn;
