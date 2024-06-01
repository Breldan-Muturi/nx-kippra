import { SingleInviteDetail } from '@/actions/invites/fetch.invites.actions';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import { ColumnDef } from '@tanstack/react-table';
import { ClipboardX, RefreshCcw } from 'lucide-react';

type InviteActionColumnProps = {
  isPending: boolean;
  revokeInvites: (ids: string[]) => void;
  resendInvites: (ids: string[]) => void;
};

const inviteColumnActions = ({
  isPending,
  revokeInvites,
  resendInvites,
}: InviteActionColumnProps): ColumnDef<SingleInviteDetail> => ({
  id: 'Actions',
  header: 'Actions',
  cell: ({ row }) => {
    const inviteId = row.original.id;
    const inviteActions: TooltipActionButtonProps[] = [
      {
        title: `Revoke invitation`,
        icon: <ClipboardX color="red" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-red-600',
        onClick: () => revokeInvites([inviteId]),
      },
      {
        title: 'Resend invite',
        icon: <RefreshCcw color="green" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-green-600',
        onClick: () => resendInvites([inviteId]),
      },
    ];
    return (
      <div className="flex items-center space-x-2">
        {inviteActions.map((action) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      </div>
    );
  },
});

export default inviteColumnActions;
