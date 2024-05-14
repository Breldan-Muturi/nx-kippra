import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

const applicationColumnCurrency: ColumnDef<SingleTableApplication> = {
  id: 'currency',
  header: 'Currency',
  cell: ({ row }) => (
    <Badge variant="secondary" className="text-green-600 border-green-600">
      {row.original.currency}
    </Badge>
  ),
};

export default applicationColumnCurrency;
