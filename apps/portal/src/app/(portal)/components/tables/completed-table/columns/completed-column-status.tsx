import { SingleCompletedProgram } from '@/actions/completed-programs/fetch.completed.actions';
import { Badge } from '@/components/ui/badge';
import { formatCompletionStatus } from '@/helpers/enum.helpers';
import { cn } from '@/lib/utils';
import { CompletionStatus } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

const completedColumnStatus: ColumnDef<SingleCompletedProgram> = {
  id: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const isApproved = row.original.status === CompletionStatus.APPROVED;
    return (
      <Badge
        variant={isApproved ? 'default' : 'outline'}
        className={cn(isApproved ? 'bg-green-600' : 'border-muted-background')}
      >
        {formatCompletionStatus(row.original.status)}
      </Badge>
    );
  },
  enableHiding: false,
};

export default completedColumnStatus;
