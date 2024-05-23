import { SingleCompletedProgram } from '@/actions/completed-programs/fetch.completed.actions';
import { ColumnDef } from '@tanstack/react-table';

const completedColumnProgram: ColumnDef<SingleCompletedProgram> = {
  id: 'program',
  header: 'Program',
  cell: ({ row }) => {
    const { title, code } = row.original.program;
    return (
      <div className="flex flex-col flex-grow min-w-40">
        <p>{title}</p>
        <p className="font-semibold text-green-600">{code}</p>
      </div>
    );
  },
  enableHiding: false,
};

export default completedColumnProgram;
