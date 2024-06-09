import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import { ColumnDef } from '@tanstack/react-table';
import { MousePointerSquare } from 'lucide-react';

type ParticipantColumnActionProps = {
  isPending: boolean;
  viewParticipant: (id: string) => void;
};

const participantColumnActions = ({
  isPending,
  viewParticipant,
}: ParticipantColumnActionProps): ColumnDef<SingleParticipantDetail> => ({
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => {
    const { id, name } = row.original;
    const participantActions: TooltipActionButtonProps[] = [
      {
        title: `View ${name}'s details`,
        icon: <MousePointerSquare className="size-5" />,
        disabled: isPending,
        onClick: () => viewParticipant(id),
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

export default participantColumnActions;
