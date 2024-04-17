import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { formatRoles } from '@/helpers/enum.helpers';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnRole: ColumnDef<SingleParticipantDetail> = {
  id: 'Role',
  header: 'Role',
  cell: ({ row }) => formatRoles(row.original.role),
};

export default participantColumnRole;
