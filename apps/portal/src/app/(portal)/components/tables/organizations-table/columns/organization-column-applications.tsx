import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const organizationColumnApplications: ColumnDef<SingleOrganizationDetail> = {
  id: 'Applications',
  header: 'Applications',
  cell: ({ row }) => {
    const applicationsCount = row.original._count.applications;
    const badgeText = `${applicationsCount} application${applicationsCount === 1 ? '' : 's'}`;
    return (
      <Badge
        variant="outline"
        className={cn(
          applicationsCount > 0
            ? 'border-green-600 text-green-600'
            : 'border-muted-foreground text-muted-foreground',
        )}
      >
        {badgeText}
      </Badge>
    );
  },
};

export default organizationColumnApplications;
