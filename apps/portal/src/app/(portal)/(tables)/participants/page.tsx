import { fetchParticipantsTable } from '@/actions/participants/fetch.participants.actions';
import {
  FetchParticipantsType,
  fetchParticipantsSchema,
} from '@/validation/participants/participants.validation';
import React from 'react';
import ParticipantsTable from '../../components/common/tables/participants-table/participants-table';

const Participants = async ({
  searchParams,
}: {
  searchParams: FetchParticipantsType;
}) => {
  const fetchParams: FetchParticipantsType =
    fetchParticipantsSchema.parse(searchParams);
  const participantsInfo = await fetchParticipantsTable({ fetchParams });

  if ('error' in participantsInfo) {
    return (
      // Return an error component in this case
      <div>{`There was an error fetching participants ${participantsInfo.error}`}</div>
    );
  }
  return <ParticipantsTable {...participantsInfo} />;
};

export default Participants;
