'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationRole, UserRole } from '@prisma/client';
import { SingleCompletedProgramArgs } from './common.completed.actions';

const userPromise = async ({
  id,
  organizationIds,
}: {
  id: string;
  organizationIds: string[];
}) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      _count: {
        select: {
          organizations: {
            where: {
              AND: [
                { role: OrganizationRole.OWNER },
                { organizationId: { in: organizationIds } },
              ],
            },
          },
        },
      },
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const completedPromise = async (id: string) =>
  await db.completedProgram.findUnique({
    where: { id },
    include: {
      creator: true,
      participant: true,
      program: true,
      completionEvidence: true,
    },
  });
type CompletedPromise = Awaited<ReturnType<typeof completedPromise>>;
export type ViewCompletedProgram = NonNullable<CompletedPromise>;

type SingleCompletedProgram = { error: string } | ViewCompletedProgram;
export const singleCompletedProgram = async ({
  id,
  organizationIds,
}: SingleCompletedProgramArgs): Promise<SingleCompletedProgram> => {
  const userId = await currentUserId();
  if (!userId)
    return {
      error: "You must be logged in to view this completed program's details",
    };

  let user: UserPromise, completedProgram: CompletedPromise;
  try {
    [user, completedProgram] = await Promise.all([
      userPromise({ id: userId, organizationIds }),
      completedPromise(id),
    ]);
  } catch (error) {
    console.error(
      'Failed to fetch completed program due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to fetch completed program due to a server error. Please try again later',
    };
  }

  if (!user)
    return {
      error:
        'Failed to fetch completed program due to a server error. Please try again later',
    };

  if (!completedProgram)
    return {
      error:
        'Failed to fetch completed program due to a server error. Please try again later',
    };

  if (
    user.role !== UserRole.ADMIN &&
    user._count.organizations < 1 &&
    user.id !== completedProgram.participantId
  )
    return {
      error: 'You are not authorized to view this completed program',
    };

  return completedProgram;
};
