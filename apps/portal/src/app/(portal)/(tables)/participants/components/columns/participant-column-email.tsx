import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnEmail: ColumnDef<SingleParticipantDetail> = {
  id: 'Email',
  header: 'Email',
  cell: ({ row }) => row.original.email,
};

export default participantColumnEmail;
