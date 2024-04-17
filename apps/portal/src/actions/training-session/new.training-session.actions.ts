'use server';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  NewTrainingSessionForm,
  trainingSessionSchema,
} from '@/validation/training-session/training-session.validation';
import { UserRole } from '@prisma/client';

export const newTrainingSession = async (
  trainingSessionData: NewTrainingSessionForm,
): Promise<{ error?: string; success?: string }> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN) {
    return { error: 'You are not permited to create courses' };
  }
  const validTrainingSession =
    trainingSessionSchema.safeParse(trainingSessionData);
  if (!validTrainingSession.success) {
    return { error: 'Invalid training session fields' };
  }
  const { usingDifferentFees, usingUsd, ...sessionData } =
    validTrainingSession.data;
  try {
    await db.trainingSession.create({
      data: sessionData,
    });
    return { success: 'New training session created successfully' };
  } catch (error) {
    console.log('Error saving the new session: ', error);
    return { error: 'Something went wrong. Please try again later' };
  }
};
