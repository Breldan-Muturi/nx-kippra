import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import TooltipLinkButton, {
  TooltipLinkButtonProps,
} from '@/components/buttons/tooltip-link-button';
import { ActionTriggerType } from '@/types/actions.types';
import { ColumnDef } from '@tanstack/react-table';
import { Download, MousePointerSquare } from 'lucide-react';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '../../../../../../components/buttons/tooltip-action-button';

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
      const {
        id,
        paymentReceipt,
        application: { id: applicationId },
      } = row.original;
      const hasReceipt =
        paymentReceipt && paymentReceipt.filePath ? true : false;
      const receiptButton: TooltipActionButtonProps = {
        title: `Download receipt`,
        isVisible: hasReceipt,
        icon: <Download color="green" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-green-600',
        onClick: () => {
          if (hasReceipt) viewReceipt(paymentReceipt!.filePath);
        },
      };
      const applicationButton: TooltipLinkButtonProps = {
        title: `View application details`,
        icon: <MousePointerSquare className="size-5" />,
        disabled: isPending,
        href: `/applications/?applicationId=${applicationId}`,
      };
      return (
        <div className="flex items-center space-x-2">
          <TooltipLinkButton {...applicationButton} />
          <TooltipActionButton {...receiptButton} />
        </div>
      );
    },
    enableHiding: false,
  };
};

export default paymentActionsColumn;
