import { filterApplicationsTable } from '@/actions/applications/filter.applications.actions';
import ApplicationsTable from '@/app/(portal)/components/common/tables/applications-table/applications-table';
import {
  FetchApplicationType,
  fetchApplicationsSchema,
} from '@/validation/applications/table.application.validation';
import React from 'react';

const OrganizationApplications = async ({
  searchParams,
  params: { organizationId },
}: {
  searchParams: FetchApplicationType;
  params: { organizationId: string };
}) => {
  const validSearch = fetchApplicationsSchema.safeParse(searchParams);
  if (!validSearch.success)
    return <div>Invalid search params, please try again later</div>;
  const applicationTable = await filterApplicationsTable(
    validSearch.data,
    organizationId,
  );
  if ('error' in applicationTable) return <div>{applicationTable.error}</div>;
  return <ApplicationsTable className="mt-8" {...applicationTable} />;
};

export default OrganizationApplications;
