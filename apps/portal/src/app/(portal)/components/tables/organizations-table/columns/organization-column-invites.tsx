import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const organizationColumnInvites: ColumnDef<SingleOrganizationDetail> = {
  id: 'Invites',
  header: 'Invites',
  cell: ({ row }) => {
    const invitesCount = row.original.invites.length;
    const badgeText = `${invitesCount} invite${invitesCount === 1 ? '' : 's'}`;
    return (
      <Badge
        variant="outline"
        className={cn(
          invitesCount > 0
            ? 'border-green-600 text-green-600'
            : 'border-muted-foreground text-muted-foreground',
        )}
      >
        {badgeText}
      </Badge>
    );
  },
};

export default organizationColumnInvites;
