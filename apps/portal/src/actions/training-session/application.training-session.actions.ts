'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';

const fetchTrainingSessions = async (programId: string) =>
  await db.program.findUnique({
    where: { id: programId },
    select: {
      trainingSessions: {
        where: { endDate: { gte: new Date() } },
        select: { id: true, startDate: true, endDate: true, mode: true },
      },
    },
  });
export type DynamicTrainingOption = NonNullable<
  Awaited<ReturnType<typeof fetchTrainingSessions>>
>['trainingSessions'][number];

export type FetchTrainingReturn =
  | { error: string }
  | { trainingOptions: DynamicTrainingOption[] };

export const fetchProgramTrainingSessions = async (
  programId: string,
): Promise<FetchTrainingReturn> => {
  const userId = await currentUserId();
  if (!userId) {
    return { error: 'Log in to proceed' };
  }
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!existingUser || !existingUser.id) {
    return { error: 'We could not match your user Id to any existing users' };
  }
  try {
    const result = await fetchTrainingSessions(programId);
    if (
      !result ||
      !result.trainingSessions ||
      !result.trainingSessions.length
    ) {
      return { error: 'This program has no upcoming training sessions' };
    }
    return {
      trainingOptions: result.trainingSessions,
    };
  } catch (error) {
    console.error('Error fetching training sessions: ', error);
    return { error: 'Error fetching training sessions' };
  }
};
