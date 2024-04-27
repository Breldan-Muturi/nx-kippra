import React from 'react';
import ApplicationsTable from '../../components/common/tables/applications-table/applications-table';
import { filterApplicationsTable } from '@/actions/applications/filter.applications.actions';
import {
  FetchApplicationType,
  fetchApplicationsSchema,
} from '@/validation/applications/table.application.validation';

const ApplicationsPage = async ({
  searchParams,
}: {
  searchParams: FetchApplicationType;
}) => {
  const validSearch = fetchApplicationsSchema.safeParse(searchParams);
  if (!validSearch.success)
    return <div>Invalid search params, please try again later</div>;
  const applicationTable = await filterApplicationsTable(validSearch.data);
  if ('error' in applicationTable) return <div>{applicationTable.error}</div>;

  return <ApplicationsTable {...applicationTable} />;
};

export default ApplicationsPage;
