import { Badge } from '@/components/ui/badge';
import { formatCitizenship } from '@/helpers/enum.helpers';
import { cn } from '@/lib/utils';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { Citizenship } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

const participantApplicationCitizenship: ColumnDef<ParticipantSubmitOption> = {
  id: 'citizenship',
  header: 'Citizenship',
  cell: ({ row }) => {
    const citizenship = formatCitizenship(row.original.citizenship);
    const isKenyan = row.original.citizenship === Citizenship.KENYAN;
    const isEastAfrican = row.original.citizenship === Citizenship.EAST_AFRICAN;
    const isGlobal = row.original.citizenship === Citizenship.GLOBAL;
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-2',
          !isKenyan && 'border-green-600',
          // isEastAfrican ? 'bg-opacity-5' : 'bg-opacity-100',
          isGlobal ? 'bg-green-600' : 'bg-background',
          !isGlobal ? 'text-green-600' : 'text-gray-50',
        )}
      >
        {citizenship}
      </Badge>
    );
  },
};

export default participantApplicationCitizenship;
