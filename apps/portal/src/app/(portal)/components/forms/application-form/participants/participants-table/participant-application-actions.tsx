import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
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
    const participantActions: TooltipActionButtonProps[] = [
      {
        title: `View ${name}'s details`,
        icon: <MousePointerSquare className="size-5" />,
        disabled: isPending,
        onClick: () => viewParticipant(userId!),
        isVisible: !!userId,
      },
      {
        title: `Remove ${name}`,
        icon: <Trash2 color="red" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-red-600',
        onClick: () => removeParticipant(email),
      },
    ];
    return (
      <div className="flex items-center space-x-2">
        {participantActions.map((action) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      </div>
    );
  },
});

export default participantApplicationActions;
