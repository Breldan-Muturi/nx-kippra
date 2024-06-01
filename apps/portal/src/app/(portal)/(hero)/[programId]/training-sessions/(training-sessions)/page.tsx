import { fetchTrainingSessions } from '@/actions/training-session/fetch.training-sessions.actions';
import TrainingSessions from '@/app/(portal)/components/cards/training-sessions/training-sessions';
import { FetchSessionsSchema } from '@/validation/training-session/fetch.sessions.validations';

const ProgramSessions = async ({
  params: { programId },
  searchParams,
}: {
  params: { programId: string };
  searchParams: FetchSessionsSchema & { trainingSessionId?: string };
}) => {
  const { trainingSessionId, ...fetchParams } = searchParams;
  const fetchSessionsReturn = await fetchTrainingSessions({
    ...fetchParams,
    programId,
  });

  if ('error' in fetchSessionsReturn)
    return (
      <div>{`There was an error fetching organizations: ${fetchSessionsReturn.error}`}</div>
    );
  return (
    <TrainingSessions
      {...{ ...fetchSessionsReturn, programId, trainingSessionId }}
    />
  );
};

export default ProgramSessions;
