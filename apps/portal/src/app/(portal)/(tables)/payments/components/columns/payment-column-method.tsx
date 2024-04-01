import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

const paymentMethodColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'Method',
  header: 'Method',
  cell: ({ row }) => (
    <Badge variant="outline">{row.original.payment_channel}</Badge>
  ),
};

export default paymentMethodColumn;
