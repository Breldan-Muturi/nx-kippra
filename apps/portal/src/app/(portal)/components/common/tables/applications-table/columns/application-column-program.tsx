import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { ColumnDef } from '@tanstack/react-table';

const applicationProgramColumn: ColumnDef<SingleTableApplication> = {
  id: 'program',
  header: 'Program',
  cell: ({ row }) => {
    const trainingSession = row.original.trainingSession;
    if (!trainingSession) return null;
    const { title, code } = (trainingSession as any).program;
    return (
      <div className="flex flex-col flex-grow min-w-40">
        <p>{title}</p>
        <p className="font-semibold text-green-600">{code}</p>
      </div>
    );
  },
};

export default applicationProgramColumn;
