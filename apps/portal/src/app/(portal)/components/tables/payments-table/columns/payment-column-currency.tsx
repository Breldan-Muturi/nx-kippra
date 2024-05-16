import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

const paymentColumnCurrency: ColumnDef<SinglePaymentDetail> = {
  id: 'Currency',
  header: 'Currency',
  cell: ({ row }) => (
    <Badge variant="secondary" className="text-green-600 border-green-600">
      {row.original.currency}
    </Badge>
  ),
};

export default paymentColumnCurrency;
