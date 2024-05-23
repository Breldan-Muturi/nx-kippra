import { fetchCompletedPrograms } from '@/actions/completed-programs/fetch.completed.actions';
import {
  FetchCompletedSchema,
  fetchCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import CompletedTable from '../../components/common/tables/completed-table/completed-table';

const CompletedPrograms = async ({
  searchParams,
}: {
  searchParams: FetchCompletedSchema;
}) => {
  const validSearch = fetchCompletedSchema.safeParse(searchParams);
  if (!validSearch.success) return <div>Invalid params</div>;
  const completedTable = await fetchCompletedPrograms(searchParams);
  if ('error' in completedTable) return <div>{completedTable.error}</div>;

  return <CompletedTable {...completedTable} />;
};

export default CompletedPrograms;
