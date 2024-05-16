import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

const applicationFeeColumn: ColumnDef<SingleTableApplication> = {
  id: 'fee',
  header: 'Fee',
  cell: ({ row }) =>
    !!row.original.applicationFee ? (
      <div className="flex min-w-28">
        {row.original.applicationFee.toLocaleString('en-US')}
      </div>
    ) : (
      <Badge variant="outline">Pending</Badge>
    ),
};

export default applicationFeeColumn;
