'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateCompletedEmail } from '@/mail/completed-program.mail';
import { ActionReturnType } from '@/types/actions.types';
import {
  UpdateCompletedSchema,
  updateCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { FilePreviewSchema } from '@/validation/reusable.validation';
import { OrganizationRole, UserRole } from '@prisma/client';
import { deleteFiles, filesUpload } from '../firebase/storage.actions';

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

const completedPromise = async ({
  id,
  sameUserParticipant,
}: {
  id: string;
  sameUserParticipant: boolean;
}) =>
  await db.completedProgram.findUnique({
    where: { id },
    select: {
      id: true,
      creator: { select: { email: true } },
      completionEvidence: true,
      participant: {
        select: {
          id: sameUserParticipant ? undefined : true,
          email: sameUserParticipant ? undefined : true,
          name: sameUserParticipant ? undefined : true,
          organizations: {
            select: { organizationId: sameUserParticipant ? undefined : true },
          },
        },
      },
    },
  });
type CompletedPromise = Awaited<ReturnType<typeof completedPromise>>;

const programPromise = async (id: string) =>
  await db.program.findUnique({ where: { id }, select: { id: true } });
type ProgramPromise = Awaited<ReturnType<typeof programPromise>>;

export type UpdateCompletedArgs = UpdateCompletedSchema & {
  formData: FormData;
  filePreviews: FilePreviewSchema[];
};

export const updateCompleted = async ({
  formData,
  filePreviews,
  ...updateData
}: UpdateCompletedArgs): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You need to be logged in to proceed' };
  const validUpdate = updateCompletedSchema.safeParse(updateData);
  if (!validUpdate.success) return { error: 'Invalid fields' };
  const { id, participantId, programId, completionDate } = validUpdate.data;

  const sameUserParticipant = userId === participantId;

  let user: UserPromise,
    completedProgram: CompletedPromise,
    program: ProgramPromise;
  try {
    [user, completedProgram, program] = await Promise.all([
      userPromise(userId),
      completedPromise({ id, sameUserParticipant }),
      programPromise(programId),
    ]);
  } catch (e) {
    console.error(
      'Failed to update completed program due to a server error: ',
      e,
    );
    return {
      error: 'Failed to update completed program due to a server error',
    };
  }

  if (!user)
    return {
      error:
        'Failed to authenticate request because your account was not found',
    };
  if (!completedProgram)
    return {
      error:
        'Failed to authenticate request because the completed program was not found',
    };
  if (!program)
    return {
      error:
        'Failed to authenticate request because the program passed was not found',
    };

  const ownsOrg = user.organizations.some(({ organizationId }) =>
    completedProgram?.participant.organizations.some(
      (org) => org.organizationId === organizationId,
    ),
  );

  const isAdmin = user.role === UserRole.ADMIN;

  if (!sameUserParticipant && !isAdmin && !ownsOrg)
    return { error: 'You are not authorized to update this completed program' };

  const removedFiles = completedProgram.completionEvidence.filter(
    ({ filePath }) =>
      !filePreviews.map(({ filePath }) => filePath).includes(filePath),
  );

  const files = formData.getAll('completionEvidence') as File[];
  const hasFiles = files.length > 0;
  const participantName = sameUserParticipant
    ? user.name
    : completedProgram.participant.name;

  const [deletedFiles, uploadFiles] = await Promise.all([
    removedFiles.length > 0
      ? deleteFiles(removedFiles.map(({ filePath }) => filePath))
      : Promise.resolve(undefined),
    hasFiles
      ? filesUpload(files, `completed-evidence/${participantName}`)
      : Promise.resolve(undefined),
  ]);
  if (deletedFiles && 'error' in deletedFiles)
    return { error: deletedFiles.error };
  if (uploadFiles && 'error' in uploadFiles)
    return { error: uploadFiles.error };

  try {
    await Promise.all([
      db.completedProgram.update({
        where: { id: completedProgram.id },
        data: {
          completionDate,
          programId,
          completionEvidence: {
            deleteMany: removedFiles,
            create: uploadFiles,
          },
        },
      }),
      updateCompletedEmail({
        participantName,
        to: [
          completedProgram.creator.email,
          user.email,
          completedProgram.participant.email,
        ],
      }),
    ]);
    return { success: 'Completed program updated successfully' };
  } catch (e) {
    console.error(
      'Failed to update completed program due to a server error: ',
      e,
    );
    return {
      error: 'Failed to update completed program due to a server error',
    };
  }
};
