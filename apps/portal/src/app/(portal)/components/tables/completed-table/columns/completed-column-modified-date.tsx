import { SingleCompletedProgram } from '@/actions/completed-programs/fetch.completed.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const completedColumnModifiedDate: ColumnDef<SingleCompletedProgram> = {
  id: 'completion-date',
  header: 'Last Modified',
  cell: ({ row }) => {
    const date = format(row.original.updatedAt, 'PPP');
    return <p>{date}</p>;
  },
  enableHiding: false,
};

export default completedColumnModifiedDate;
