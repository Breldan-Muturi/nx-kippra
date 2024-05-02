import { fetchOrganizationInvites } from '@/actions/invites/fetch.invites.actions';
import { FetchInvitesSchema } from '@/validation/organization/organization.invites.validation';
import React from 'react';
import InvitesTable from './components/invites-table';

const OrganizationInvites = async ({
  searchParams,
  params: { organizationId },
}: {
  searchParams: FetchInvitesSchema;
  params: { organizationId: string };
}) => {
  const invites = await fetchOrganizationInvites({
    organizationId,
    fetchParams: searchParams,
  });

  if ('error' in invites)
    return (
      <div>{`There was an error fetching organizations: ${invites.error}`}</div>
    );

  return <InvitesTable className="mt-8" {...invites} />;
};

export default OrganizationInvites;
