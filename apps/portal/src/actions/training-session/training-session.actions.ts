'use server';

import { getTrainingSessionApplicationData } from '@/helpers/training-session.helpers';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  FilterTrainingSessionSchemaType,
  filterTrainingSessionsSchema,
} from '@/validation/training-session/training-session.validation';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

export const filterCourse = async (values: FilterTrainingSessionSchemaType) => {
  const validatedFilters = filterTrainingSessionsSchema.safeParse(values);
  if (!validatedFilters.success) return { error: 'Invalid fields' };
  const { name, endDate, mode, startDate, venue } = validatedFilters.data;
  const searchParams = new URLSearchParams({
    ...(name && { name: name.trim() }),
    ...(venue && { venue }),
    ...(mode && { mode }),
    ...(startDate && { sd: startDate.toISOString() }),
    ...(endDate && { ed: endDate.toISOString() }),
  });
  redirect(`/?${searchParams.toString()}`);
};

export const getPageTrainingSession = async (id: string) => {
  const trainingSessionApplicationData =
    await getTrainingSessionApplicationData(id);

  if (!trainingSessionApplicationData)
    return { error: 'Training session not found' };
  return { success: trainingSessionApplicationData };
};

export const updateTrainingSession = async () => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'You are not permited to create courses' };
};

export const deleteTrainingSession = async (
  id: string,
): Promise<{ error?: string; success?: string }> => {
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
