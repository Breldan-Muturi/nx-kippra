import { fetchCompletedPrograms } from '@/actions/completed-programs/fetch.completed.actions';
import { FetchCompletedSchema } from '@/validation/completed-program/completed-program.validation';

const CompletedPrograms = async ({
  searchParams,
}: {
  searchParams: FetchCompletedSchema;
}) => {
  const completedTable = await fetchCompletedPrograms({
    fetchParams: searchParams,
  });
  if ('error' in completedTable) return <div>{completedTable.error}</div>;

  return <div>CompletedPrograms</div>;
};

export default CompletedPrograms;
