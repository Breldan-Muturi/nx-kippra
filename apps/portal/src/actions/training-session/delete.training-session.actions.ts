'use server';

import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnType } from '@/types/actions.types';
import { UserRole } from '@prisma/client';

export const deleteTrainingSession = async (
  id: string,
): Promise<ActionReturnType> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'You are not permited to delete training sessions' };
  try {
    await db.trainingSession.delete({ where: { id } });
    return { success: 'Training session deleted successfully' };
  } catch (error) {
    console.debug(error);
    return { error: 'Something went wrong. Please try again later' };
  }
};
