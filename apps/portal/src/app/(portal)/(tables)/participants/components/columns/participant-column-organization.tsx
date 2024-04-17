import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnOrganization: ColumnDef<SingleParticipantDetail> = {
  id: 'Listed Organizations',
  header: 'Listed Organizations',
  cell: ({ row }) => `${row.original._count.organizations} organizations`,
};

export default participantColumnOrganization;
