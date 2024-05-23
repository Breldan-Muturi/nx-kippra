'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { completedResponseEmail } from '@/mail/completed-program.mail';
import { ActionReturnType } from '@/types/actions.types';
import { CompletionStatus, UserRole } from '@prisma/client';

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: { name: true, id: true, role: true },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const completedPromise = async (ids: string[]) =>
  await db.completedProgram.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      createdAt: true,
      participant: { select: { name: true, email: true } },
      creator: { select: { name: true, email: true } },
      program: { select: { title: true, code: true } },
    },
  });
type CompletedPromise = Awaited<ReturnType<typeof completedPromise>>;

export const respondCompleted = async ({
  ids,
  message,
  approved,
}: {
  ids: string[];
  message?: string;
  approved: boolean;
}): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId)
    return {
      error: `You need to be logged in to ${approved ? 'approve' : 'reject'} applications`,
    };

  let user: UserPromise, completedPrograms: CompletedPromise;
  try {
    [user, completedPrograms] = await Promise.all([
      userPromise(userId),
      completedPromise(ids),
    ]);
  } catch (error) {
    console.error('Failed to authorize request due to a server error: ', error);
    return {
      error:
        'Failed to authorize request due to a server error. Please try again later',
    };
  }

  if (!user || user.role !== UserRole.ADMIN)
    return {
      error: `You are not authorized to ${approved ? 'approve' : 'reject'} applications`,
    };
  if (!completedPrograms || !completedPrograms.length)
    return { error: 'No matching completed programs.' };

  try {
    await db.completedProgram.updateMany({
      where: { id: { in: ids } },
      data: {
        status: approved
          ? CompletionStatus.APPROVED
          : CompletionStatus.REJECTED,
      },
    });
  } catch (error) {
    console.error(
      `Failed to ${approved ? 'approve' : 'reject'} completed program due to a server error: `,
      error,
    );
    return {
      error: `Failed to ${approved ? 'approve' : 'reject'} completed program due to a server error. Please try again later`,
    };
  }

  try {
    await Promise.all(
      completedPrograms.map(
        async ({
          createdAt,
          creator: { email: creatorEmail },
          participant: { email: participantEmail, name },
          program: { title },
        }) =>
          completedResponseEmail({
            to: [participantEmail, creatorEmail],
            name,
            title,
            createdAt,
            message,
            accepted: approved,
          }),
      ),
    );
    return { success: 'Completed programs rejected successfully' };
  } catch (e) {
    console.error('Failed to notify participant due to a server error: ', e);
    return { error: 'Failed to notify participant due to a server error' };
  }
};
