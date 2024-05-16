import { fetchOrganizationsTable } from '@/actions/organization/filter.organization.actions';
import { OrganizationTableSchema } from '@/validation/organization/organization.validation';
import OrganizationsTable from '../../components/tables/organizations-table/organizations-table';

export type OrganizationSearchParams = OrganizationTableSchema & {
  token?: string;
};
const Organizations = async ({
  searchParams,
}: {
  searchParams: OrganizationSearchParams;
}) => {
  const fetchOrganizationReturn = await fetchOrganizationsTable(searchParams);

  if ('error' in fetchOrganizationReturn)
    return (
      <div>{`There was an error fetching organizations: ${fetchOrganizationReturn.error}`}</div>
    );

  return (
    <OrganizationsTable
      organizationTable={fetchOrganizationReturn}
      searchParams={searchParams}
    />
  );
};

export default Organizations;
