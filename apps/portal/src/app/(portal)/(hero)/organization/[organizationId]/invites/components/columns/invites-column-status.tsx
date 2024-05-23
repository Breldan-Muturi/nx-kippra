import { SingleInviteDetail } from '@/actions/invites/fetch.invites.actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const invitesColumnStatus: ColumnDef<SingleInviteDetail> = {
  id: 'Status',
  header: 'Status',
  cell: ({ row }) => {
    const isExpired = new Date(row.original.expires) < new Date();
    return (
      <Badge
        variant={isExpired ? 'destructive' : 'outline'}
        className={cn(
          isExpired
            ? ''
            : 'text-muted-background border-2 border-muted-background',
        )}
      >
        {isExpired ? 'Expired' : 'Pending'}
      </Badge>
    );
  },
};

export default invitesColumnStatus;
