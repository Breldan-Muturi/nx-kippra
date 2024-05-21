import { SingleCompletedProgram } from '@/actions/completed-programs/fetch.completed.actions';
import TableUserCell from '@/components/table/table-user-cell';
import { ColumnDef } from '@tanstack/react-table';

const completedColumnParticipant: ColumnDef<SingleCompletedProgram> = {
  id: 'participant',
  header: 'Participant',
  cell: ({ row }) => {
    const { name, image, email } = row.original.participant;
    return (
      <TableUserCell
        userName={name}
        userImage={image?.fileUrl}
        userTableInfo={email}
      />
    );
  },
  enableHiding: false,
};

export default completedColumnParticipant;
