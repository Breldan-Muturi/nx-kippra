'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const programPromise = async (programId: string) =>
  await db.program.findUnique({
    where: { id: programId },
    select: {
      id: true,
      title: true,
      imgUrl: true,
      code: true,
      summary: true,
      serviceId: true,
      prerequisites: { select: { id: true } },
      moodleCourseId: true,
    },
  });
export type SingleProgramType = NonNullable<
  Awaited<ReturnType<typeof programPromise>>
>;
export type SingleProgramReturn =
  | { error: string }
  | { program: SingleProgramType };

export const getSingleProgram = async (
  programId: string,
): Promise<SingleProgramReturn> => {
  const userId = await currentUserId();
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (
    !existingUser ||
    !existingUser.role ||
    existingUser.role !== UserRole.ADMIN
  ) {
    return { error: 'You are not authorized to update this program' };
  }
  try {
    const program = await programPromise(programId);
    if (!program)
      return {
        error:
          "There was an error retrieving this program's details, please try again later",
      };
    return { program };
  } catch (error) {
    console.error('Error retrieving program information: ', error);
    return { error: 'Error retrieving program information' };
  }
};
