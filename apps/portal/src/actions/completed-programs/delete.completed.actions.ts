'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { completedDeletedEmail } from '@/mail/completed-program.mail';
import { ActionReturnType } from '@/types/actions.types';
import { OrganizationRole, UserRole } from '@prisma/client';
import { deleteFiles } from '../firebase/storage.actions';

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organizations: {
        where: { role: OrganizationRole.OWNER },
        select: { organizationId: true },
      },
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const completedPromise = async (ids: string[]) =>
  await db.completedProgram.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      completionEvidence: { select: { filePath: true } },
      participantId: true,
      participant: {
        select: {
          email: true,
          organizations: { select: { organizationId: true } },
        },
      },
      creator: { select: { email: true } },
    },
  });
type CompletedPromise = Awaited<ReturnType<typeof completedPromise>>;

export const deleteCompleted = async ({
  ids,
  message,
}: {
  ids: string[];
  message?: string;
}): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You must be logged in to delete applications' };

  let user: UserPromise, completedPrograms: CompletedPromise;
  try {
    [user, completedPrograms] = await Promise.all([
      userPromise(userId),
      completedPromise(ids),
    ]);
  } catch (error) {
    console.error(
      'Failed to authenticate request due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to authenticate request due to a server error. Please try again later',
    };
  }

  if (!user) return { error: 'User not found' };
  if (!completedPrograms || !completedPrograms.length)
    return { error: 'These completed programs were not found' };

  const checkOwner = (organizationId: string) =>
    user?.organizations.some((org) => org.organizationId === organizationId);

  const canDelete = (completedProgram: CompletedPromise[number]) =>
    user?.role === UserRole.ADMIN ||
    completedProgram.participantId === user?.id ||
    completedProgram.participant.organizations.some(({ organizationId }) =>
      checkOwner(organizationId),
    );

  const authorizedDelete = completedPrograms.filter(canDelete);
  if (!authorizedDelete || !authorizedDelete.length)
    return {
      error: 'You are not authorized to delete these completed programs',
    };

  try {
    await Promise.all([
      db.completedProgram.deleteMany({
        where: { id: { in: authorizedDelete.map(({ id }) => id) } },
      }),
      deleteFiles(
        authorizedDelete.flatMap(({ completionEvidence }) =>
          completionEvidence.map(({ filePath }) => filePath),
        ),
      ),
      completedDeletedEmail({
        name: user.name,
        bcc: [
          ...new Set([
            ...authorizedDelete.map(({ participant }) => participant.email),
            ...authorizedDelete.map(({ creator }) => creator.email),
            user.email,
          ]),
        ],
        reply_to: [user.email],
        message,
      }),
    ]);
    if (authorizedDelete.length !== completedPrograms.length) {
      return {
        success: `${authorizedDelete.length}/${completedPrograms.length} deleted. You are not authorized to delete the rest.`,
      };
    }
    return { success: 'Completed programs deleted successfully' };
  } catch (error) {
    console.error(
      'Failed to delete completed programs due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to delete completed programs due to a server error. Please try again later',
    };
  }
};
