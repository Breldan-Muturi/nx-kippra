import { SingleCompletedProgram } from '@/actions/completed-programs/fetch.completed.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const completedColumnCompletionDate: ColumnDef<SingleCompletedProgram> = {
  id: 'completion-date',
  header: 'Date Completed',
  cell: ({ row }) => {
    const date = format(row.original.completionDate, 'PPP');
    return <p>{date}</p>;
  },
  enableHiding: false,
};

export default completedColumnCompletionDate;
