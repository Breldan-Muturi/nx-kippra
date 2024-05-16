import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

const applicationColumnCurrency: ColumnDef<SingleTableApplication> = {
  id: 'currency',
  header: 'Currency',
  cell: ({ row }) => {
    const isUsd = row.original.currency === 'USD';
    return (
      <Badge
        variant="secondary"
        className={cn(
          ' border-green-600',
          isUsd ? 'text-white bg-green-600' : 'text-green-600',
        )}
      >
        {row.original.currency}
      </Badge>
    );
  },
};

export default applicationColumnCurrency;
