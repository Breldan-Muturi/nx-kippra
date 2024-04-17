import { fetchParticipantsTable } from '@/actions/participants/fetch.participants.actions';
import { currentUserId } from '@/lib/auth';
import {
  FetchParticipantsType,
  ParticipantsSearchParamsType,
  fetchParticipantsSchema,
} from '@/validation/participants/participants.validation';
import { redirect } from 'next/navigation';
import React from 'react';
import ParticipantsTable from './components/participants-table';

const Participants = async ({
  searchParams,
}: {
  searchParams: ParticipantsSearchParamsType;
}) => {
  const userId = await currentUserId();
  if (!userId) redirect('/');
  const fetchParticipantsParams: FetchParticipantsType =
    fetchParticipantsSchema.parse({
      userId,
      ...searchParams,
    });

  const [participantsPromise] = await Promise.allSettled([
    fetchParticipantsTable(fetchParticipantsParams),
  ]);

  if (
    participantsPromise.status !== 'fulfilled' ||
    'error' in participantsPromise.value
  ) {
    return (
      // Return an error component in this case
      <div>{`There was an error fetching participants ${participantsPromise.status === 'fulfilled' ? participantsPromise.value : ''}`}</div>
    );
  }
  return (
    <>
      <ParticipantsTable
        participantsInfo={participantsPromise.value}
        tableParams={fetchParticipantsParams}
      />
    </>
  );
};

export default Participants;
