import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const organizationColumnUsers: ColumnDef<SingleOrganizationDetail> = {
  id: 'Users',
  header: 'Users',
  cell: ({ row }) => {
    const usersCount = row.original._count.users;
    const badgeText = `${usersCount} member${usersCount === 1 ? '' : 's'}`;
    return (
      <Badge
        variant="outline"
        className={cn(
          usersCount > 1
            ? 'border-green-600 text-green-600'
            : 'border-muted-foreground text-muted-foreground',
        )}
      >
        {badgeText}
      </Badge>
    );
  },
};

export default organizationColumnUsers;
