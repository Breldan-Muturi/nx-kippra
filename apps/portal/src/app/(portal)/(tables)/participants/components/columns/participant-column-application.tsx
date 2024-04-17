import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnApplication: ColumnDef<SingleParticipantDetail> = {
  id: 'Applications',
  header: 'Applications',
  cell: ({ row }) => `${row.original._count.ownedApplications} applications`,
};

export default participantColumnApplication;
