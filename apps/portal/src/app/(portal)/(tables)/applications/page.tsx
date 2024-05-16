import { filterApplicationsTable } from '@/actions/applications/filter.applications.actions';
import {
  FetchApplicationType,
  fetchApplicationsSchema,
} from '@/validation/applications/table.application.validation';
import ApplicationsTable from '../../components/common/tables/applications-table/applications-table';

const ApplicationsPage = async ({
  searchParams: { applicationId, ...fetchParams },
}: {
  searchParams: FetchApplicationType & { applicationId?: string };
}) => {
  const validSearch = fetchApplicationsSchema.safeParse(fetchParams);
  if (!validSearch.success)
    return <div>Invalid search params, please try again later</div>;
  const applicationTable = await filterApplicationsTable(validSearch.data);
  if ('error' in applicationTable) return <div>{applicationTable.error}</div>;

  return <ApplicationsTable {...{ ...applicationTable, applicationId }} />;
};

export default ApplicationsPage;
