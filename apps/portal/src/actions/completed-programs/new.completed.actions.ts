'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { newCompletedEmail } from '@/mail/completed-program.mail';
import {
  CompletedSchema,
  completedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { OrganizationRole, UserRole } from '@prisma/client';
import { filesUpload } from '../firebase/storage.actions';

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

const participantPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      organizations: { select: { organizationId: true } },
    },
  });
type ParticipantPromise = Awaited<ReturnType<typeof participantPromise>>;

const programPromise = async (id: string) =>
  await db.program.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
type ProgramPromise = Awaited<ReturnType<typeof programPromise>>;

export type NewCompletedArgs = CompletedSchema & { formData: FormData };

export const newCompleted = async ({
  formData,
  ...completedData
}: NewCompletedArgs) => {
  const userId = await currentUserId();
  if (!userId) return { error: 'Please log in to submit' };

  const validData = completedSchema.safeParse(completedData);
  if (!validData.success) {
    console.error('Invalid fields: ', validData.error);
    return { error: 'Invalid fields' };
  }
  const { programId, participantId } = validData.data;

  const sameUserParticipant = userId === completedData.participantId;

  let user: UserPromise,
    participant: ParticipantPromise | undefined,
    program: ProgramPromise;
  try {
    [user, participant, program] = await Promise.all([
      userPromise(userId),
      sameUserParticipant
        ? Promise.resolve(undefined)
        : participantPromise(participantId),
      programPromise(programId),
    ]);
  } catch (error) {
    console.error(
      'Failed to submit completed program due to a server error: ',
      error,
    );
    return {
      error: 'Failed to submit due to a server error. Please try again later',
    };
  }

  if (!user) return { error: 'User not found' };
  if (!sameUserParticipant && !participant)
    return { error: 'Participant not found' };
  if (!program) return { error: 'Program not found' };

  const ownsParticipantOrg = user.organizations.some(({ organizationId }) =>
    participant?.organizations.some(
      (participantOrg) => participantOrg.organizationId === organizationId,
    ),
  );

  const isAdmin = user.role === UserRole.ADMIN;

  if (!sameUserParticipant && !isAdmin && !ownsParticipantOrg)
    return { error: 'You are not authorized to submit this completed program' };

  const files = formData.getAll('completionEvidence') as File[];
  const completionEvidence = await filesUpload(
    files,
    `completed-evidence/${!!participant ? participant.name : user.name}`,
  );
  if ('error' in completionEvidence)
    return { error: 'Failed to upload files, please try again later' };

  try {
    await db.completedProgram.create({
      data: {
        ...validData.data,
        creatorId: user.id,
        completionEvidence: {
          createMany: { data: completionEvidence, skipDuplicates: true },
        },
      },
    });
  } catch (error) {
    console.error(
      'Failed to submit completed program due to a server error: ',
      error,
    );
    return {
      error: 'Failed to submit due to a server error. Please try again later',
    };
  }

  try {
    await newCompletedEmail({
      participantName: !!participant ? participant.name : user.name,
      programTitle: program.title,
      to: [...(participant ? [participant.email] : []), user.email],
    });
    return { success: 'New completed program added successfully' };
  } catch (e) {
    console.error(
      'Failed to send email notification due to a server error: ',
      e,
    );
    return { error: 'Failed to send email notification due to a server error' };
  }
};
