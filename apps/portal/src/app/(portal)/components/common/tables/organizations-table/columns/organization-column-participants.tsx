import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const organizationColumnParticipants: ColumnDef<SingleOrganizationDetail> = {
  id: 'Participants',
  header: 'Participants',
  cell: ({ row }) => {
    const participantsCount = row.original._count.participants;
    const badgeText = `${participantsCount} participant${participantsCount === 1 ? '' : 's'}`;
    return (
      <Badge
        variant="outline"
        className={cn(
          participantsCount > 0
            ? 'border-green-600 text-green-600'
            : 'border-muted-foreground text-muted-foreground',
        )}
      >
        {badgeText}
      </Badge>
    );
  },
};

export default organizationColumnParticipants;
