import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ActionTriggerType } from '@/types/actions.types';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { ColumnDef } from '@tanstack/react-table';

type ParticipantApplicationOwnerProps = {
  isPending: boolean;
  toggleOwner: ActionTriggerType;
};

const participantApplicationOwnerColumn = ({
  isPending,
  toggleOwner,
}: ParticipantApplicationOwnerProps): ColumnDef<ParticipantSubmitOption> => ({
  id: 'owner',
  header: 'Primary contact',
  cell: ({ row }) => {
    const { isOwner, email } = row.original;
    return (
      <div className="flex items-center space-x-2">
        <Switch
          id="is-owner"
          checked={isOwner}
          onCheckedChange={() => toggleOwner(email)}
          disabled={isPending}
        />
        <Label htmlFor="is-owner">Set primary contact</Label>
      </div>
    );
  },
});

export default participantApplicationOwnerColumn;
