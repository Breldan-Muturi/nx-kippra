import { fetchParticipantsTable } from '@/actions/participants/fetch.participants.actions';
import ParticipantsTable from '@/app/(portal)/components/common/tables/participants-table/participants-table';
import {
  FetchParticipantsType,
  fetchParticipantsSchema,
} from '@/validation/participants/participants.validation';
import React from 'react';

const OrganizationMembers = async ({
  searchParams,
  params: { organizationId },
}: {
  searchParams: FetchParticipantsType;
  params: { organizationId: string };
}) => {
  const fetchParams: FetchParticipantsType =
    fetchParticipantsSchema.parse(searchParams);
  const participantsInfo = await fetchParticipantsTable({
    fetchParams,
    organizationId,
  });

  if ('error' in participantsInfo) {
    return (
      // Return an error component in this case
      <div>{`There was an error fetching participants ${participantsInfo.error}`}</div>
    );
  }
  return <ParticipantsTable className="mt-8" {...participantsInfo} />;
};

export default OrganizationMembers;
