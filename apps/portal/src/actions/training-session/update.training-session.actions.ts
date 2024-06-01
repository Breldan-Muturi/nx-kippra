'use server';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  UpdateTrainingSessionForm,
  trainingSessionSchema,
} from '@/validation/training-session/training-session.validation';
import { UserRole } from '@prisma/client';

export const updateTrainingSession = async (
  trainingSessionData: UpdateTrainingSessionForm,
): Promise<{ error: string } | { id: string; success: string }> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN) {
    return { error: 'You are not permited to create training sessions' };
  }
  const validTrainingSession =
    trainingSessionSchema.safeParse(trainingSessionData);
  if (!validTrainingSession.success) {
    return { error: 'Invalid training session fields' };
  }
  const { id, usingDifferentFees, usingUsd, ...sessionData } =
    validTrainingSession.data;
  try {
    await db.trainingSession.update({ where: { id }, data: sessionData });
    return {
      id: id as string,
      success: 'Training session updated successfully',
    };
  } catch (error) {
    console.log('Error saving the new session: ', error);
    return { error: 'Something went wrong. Please try again later' };
  }
};
