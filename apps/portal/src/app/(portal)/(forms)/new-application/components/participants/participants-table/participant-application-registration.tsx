import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { ColumnDef } from '@tanstack/react-table';

const participantApplicationRegistration: ColumnDef<ParticipantSubmitOption> = {
  id: 'Registration',
  header: 'Registration',
  cell: ({ row }) => {
    const { userId } = row.original;
    return (
      <Badge
        color={!!userId ? 'white' : undefined}
        className={cn(!!userId && 'bg-green-600')}
      >
        {!!userId ? 'Registered participant' : 'New participant'}
      </Badge>
    );
  },
};

export default participantApplicationRegistration;
