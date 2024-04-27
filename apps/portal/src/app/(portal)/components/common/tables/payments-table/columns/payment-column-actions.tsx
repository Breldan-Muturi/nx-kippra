import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';
import TableAction, {
  TableActionProps,
} from '../../../../../../../components/table/table-action';
import { Download, MousePointerSquare } from 'lucide-react';
import { ActionTriggerType } from '@/types/actions.types';

type PaymentActionsColumnProps = {
  isPending: boolean;
  viewPayment: ActionTriggerType;
  viewReceipt: ActionTriggerType;
};

const paymentActionsColumn = ({
  isPending,
  viewPayment,
  viewReceipt,
}: PaymentActionsColumnProps): ColumnDef<SinglePaymentDetail> => {
  return {
    id: 'Actions',
    header: 'Actions',
    cell: ({ row }) => {
      const { id, paymentReceipt } = row.original;
      const hasReceipt =
        paymentReceipt && paymentReceipt.filePath ? true : false;
      const paymentActions: TableActionProps[] = [
        {
          content: `View payment details`,
          icon: <MousePointerSquare className="size-5" />,
          isPending,
          onClick: () => viewPayment(id),
        },
        {
          content: `Download receipt`,
          isVisible: hasReceipt,
          icon: <Download color="green" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-green-600',
          onClick: () => {
            if (hasReceipt) viewReceipt(paymentReceipt!.filePath);
          },
        },
      ];
      return (
        <div className="flex items-center space-x-2">
          {paymentActions.map((action) => (
            <TableAction key={action.content} {...action} />
          ))}
        </div>
      );
    },
    enableHiding: false,
  };
};

export default paymentActionsColumn;
