import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';

const paymentInvoiceColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'invoice',
  header: 'Invoice number',
  cell: ({ row }) => {
    const { invoiceNumber } = row.original.application.invoice[0];
    if (invoiceNumber) {
      return <p className="font-semibold text-green-600">{invoiceNumber}</p>;
    } else {
      return 'Not available';
    }
  },
};

export default paymentInvoiceColumn;
