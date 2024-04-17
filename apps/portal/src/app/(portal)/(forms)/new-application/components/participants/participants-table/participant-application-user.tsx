import TableUserCell from '@/components/table/table-user-cell';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { ColumnDef } from '@tanstack/react-table';

const participantApplicationColumnUser: ColumnDef<ParticipantSubmitOption> = {
  id: 'participant',
  header: 'Participant',
  cell: ({ row }) => {
    const { name, image } = row.original;
    return <TableUserCell userName={name} userImage={image} />;
  },
};

export default participantApplicationColumnUser;
