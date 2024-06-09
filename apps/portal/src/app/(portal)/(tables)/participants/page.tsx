import { fetchParticipantsTable } from '@/actions/participants/fetch.participants.actions';
import {
  FetchParticipantsType,
  fetchParticipantsSchema,
} from '@/validation/participants/participants.validation';
import ParticipantsTable from '../../components/tables/participants-table/participants-table';

const Participants = async ({
  searchParams: { participantId, ...fetchParams },
}: {
  searchParams: FetchParticipantsType & { participantId?: string };
}) => {
  const participantsInfo = await fetchParticipantsTable({
    fetchParams: fetchParticipantsSchema.parse(fetchParams),
  });

  if ('error' in participantsInfo) {
    return (
      // Return an error component in this case
      <div>{`There was an error fetching participants ${participantsInfo.error}`}</div>
    );
  }
  return (
    <ParticipantsTable
      {...{ ...participantsInfo, selectedParticipantId: participantId }}
    />
  );
};

export default Participants;
