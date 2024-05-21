import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import TableUserCell from '@/components/table/table-user-cell';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnUser: ColumnDef<SingleParticipantDetail> = {
  id: 'User',
  header: 'User',
  cell: ({ row }) => {
    const { name, image } = row.original;
    return <TableUserCell userName={name} userImage={image?.fileUrl} />;
  },
  enableHiding: false,
};

export default participantColumnUser;
