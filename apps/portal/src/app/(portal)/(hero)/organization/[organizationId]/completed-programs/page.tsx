import { fetchCompletedPrograms } from '@/actions/completed-programs/fetch.completed.actions';
import CompletedTable from '@/app/(portal)/components/tables/completed-table/completed-table';
import {
  FetchCompletedSchema,
  fetchCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';

const OrganizationCompletedPrograms = async ({
  params: { organizationId },
  searchParams,
}: {
  params: { organizationId: string };
  searchParams: FetchCompletedSchema;
}) => {
  const validSearch = fetchCompletedSchema.safeParse(searchParams);
  if (!validSearch.success) return <div>Invalid params</div>;
  const completedTable = await fetchCompletedPrograms({
    ...searchParams,
    organizationId,
  });
  if ('error' in completedTable) return <div>{completedTable.error}</div>;

  return <CompletedTable className="mt-8" {...completedTable} />;
};

export default OrganizationCompletedPrograms;
