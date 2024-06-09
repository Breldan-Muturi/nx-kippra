import { fetchParticipantsTable } from '@/actions/participants/fetch.participants.actions';
import ParticipantsTable from '@/app/(portal)/components/tables/participants-table/participants-table';
import {
  FetchParticipantsType,
  fetchParticipantsSchema,
} from '@/validation/participants/participants.validation';

const OrganizationMembers = async ({
  searchParams: { participantId, ...fetchParams },
  params: { organizationId },
}: {
  searchParams: FetchParticipantsType & { participantId?: string };
  params: { organizationId: string };
}) => {
  const participantsInfo = await fetchParticipantsTable({
    fetchParams: fetchParticipantsSchema.parse(fetchParams),
    organizationId,
  });

  if ('error' in participantsInfo) {
    return (
      // Return an error component in this case
      <div>{`There was an error fetching participants ${participantsInfo.error}`}</div>
    );
  }
  return (
    <ParticipantsTable
      className="mt-8"
      {...{ ...participantsInfo, selectedParticipantId: participantId }}
    />
  );
};

export default OrganizationMembers;
