'use server';

import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { TrainingSession, UserRole } from '@prisma/client';

export const fetchUpdateTrainingSession = async (
  id: string,
): Promise<TrainingSession | { error: string }> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin)
    return { error: 'Only admins allowed to update training sessions' };
  try {
    const trainingSession = await db.trainingSession.findUnique({
      where: { id },
    });
    if (!trainingSession)
      return {
        error:
          'Training session not found, please refresh the page and try again',
      };
    return trainingSession;
  } catch (e) {
    console.error(
      'Failed to fetch training session due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch training session due to a server error. Please try again later',
    };
  }
};
