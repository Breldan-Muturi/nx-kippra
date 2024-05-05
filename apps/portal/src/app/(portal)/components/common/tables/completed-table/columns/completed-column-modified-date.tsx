import { SingleCompletedProgram } from '@/actions/completed-programs/fetch.completed.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const completedColumnModifiedDate: ColumnDef<SingleCompletedProgram> = {
  id: 'completion-date',
  header: 'Date Completed',
  cell: ({ row }) => {
    const date = format(row.original.createdAt, 'PPP');
    return <p>{date}</p>;
  },
  enableHiding: false,
};

export default completedColumnModifiedDate;
