import { fetchCompletedPrograms } from '@/actions/completed-programs/fetch.completed.actions';
import CompletedTable from '@/app/(portal)/components/common/tables/completed-table/completed-table';
import {
  FetchCompletedSchema,
  fetchCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';

const ProgramsCompleted = async ({
  params: { programId },
  searchParams,
}: {
  params: { programId: string };
  searchParams: FetchCompletedSchema;
}) => {
  const validSearch = fetchCompletedSchema.safeParse(searchParams);
  if (!validSearch.success) return <div>Invalid params</div>;
  const completedTable = await fetchCompletedPrograms({
    ...searchParams,
    programId,
  });
  if ('error' in completedTable) return <div>{completedTable.error}</div>;

  return <CompletedTable className="mt-8" {...completedTable} />;
};

export default ProgramsCompleted;
