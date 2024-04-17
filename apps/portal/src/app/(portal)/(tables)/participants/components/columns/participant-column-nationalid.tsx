import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnNationalId: ColumnDef<SingleParticipantDetail> = {
  id: 'National Id',
  header: 'National Id',
  cell: ({ row }) => row.original.nationalId || 'Not provided',
};

export default participantColumnNationalId;
