import TableAction, { TableActionProps } from '@/components/table/table-action';
import { Badge } from '@/components/ui/badge';
import { ActionTriggerType } from '@/types/actions.types';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { ColumnDef } from '@tanstack/react-table';
import { MousePointerSquare, Trash2 } from 'lucide-react';

type ParticipantApplicationActionsProps = {
  isPending: boolean;
  viewParticipant: ActionTriggerType;
  removeParticipant: ActionTriggerType;
};

const participantApplicationActions = ({
  isPending,
  viewParticipant,
  removeParticipant,
}: ParticipantApplicationActionsProps): ColumnDef<ParticipantSubmitOption> => ({
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => {
    const { email, name, userId } = row.original;
    const participantActions: TableActionProps[] = [
      {
        content: `View ${name}'s details`,
        icon: <MousePointerSquare className="size-5" />,
        isPending,
        onClick: () => viewParticipant(userId!),
        isVisible: !!userId,
      },
      {
        content: `Remove ${name}`,
        icon: <Trash2 color="red" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-red-600',
        onClick: () => removeParticipant(email),
      },
    ];
    return (
      <div className="flex items-center space-x-2">
        {participantActions.map((action) => (
          <TableAction key={action.content} {...action} />
        ))}
      </div>
    );
  },
});

export default participantApplicationActions;
