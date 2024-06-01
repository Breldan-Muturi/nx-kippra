import { fetchTrainingSessions } from '@/actions/training-session/fetch.training-sessions.actions';
import { FetchSessionsSchema } from '@/validation/training-session/fetch.sessions.validations';
import TrainingSessions from '../components/cards/training-sessions/training-sessions';

const HomePage = async ({
  searchParams,
}: {
  searchParams: FetchSessionsSchema & { trainingSessionId?: string };
}) => {
  const { trainingSessionId, ...fetchParams } = searchParams;
  const fetchSessionsReturn = await fetchTrainingSessions(fetchParams);

  if ('error' in fetchSessionsReturn)
    return (
      <div>{`There was an error fetching organizations: ${fetchSessionsReturn.error}`}</div>
    );
  return (
    <TrainingSessions {...{ ...fetchSessionsReturn, trainingSessionId }} />
  );
};

export default HomePage;
