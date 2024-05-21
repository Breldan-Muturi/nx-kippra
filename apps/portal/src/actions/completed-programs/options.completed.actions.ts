'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { UpdateCompletedSchema } from '@/validation/completed-program/completed-program.validation';
import { FilePreviewSchema } from '@/validation/reusable.validation';
import { OrganizationRole, Prisma, UserRole } from '@prisma/client';
import path from 'path';
import {
  ProgramsOptionsPromise,
  programsOptionsPromise,
} from '../programmes/programs.options.actions';

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      organizations: {
        where: { role: OrganizationRole.OWNER },
        select: { organizationId: true },
      },
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const userOptionsPromise = async (where: Prisma.UserWhereInput) =>
  await db.user.findMany({
    where,
    select: { name: true, email: true, id: true, image: true },
  });
type UserOptionsPromise = Awaited<ReturnType<typeof userOptionsPromise>>;
export type UserOption = UserOptionsPromise[number];

type GetUserOptionsReturn = { error: string } | UserOptionsPromise;

export const getUserOptions = async (
  // id here being the organizationId: should this be in the organization page;
  id?: string,
): Promise<GetUserOptionsReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to view other participants' };

  let user: UserPromise;
  try {
    user = await userPromise(userId);
  } catch (e) {
    console.error('Failed to authenticate request due to a server error: ', e);
    return {
      error:
        'Failed to authenticate request due to a server error. Please try again later',
    };
  }

  if (!user) return { error: "Could not find this user's details." };

  let where: Prisma.UserWhereInput = {};
  if (
    id &&
    (user.role === UserRole.ADMIN ||
      user.organizations.some(({ organizationId }) => organizationId === id))
  )
    where = {
      ...where,
      organizations: {
        some: { organizationId: id },
      },
    };

  if (user.role !== UserRole.ADMIN)
    where = {
      ...where,
      OR: [
        { id: user.id },
        {
          organizations: {
            some: {
              organizationId: {
                in: user.organizations.map(
                  ({ organizationId }) => organizationId,
                ),
              },
            },
          },
        },
      ],
    };

  try {
    return await userOptionsPromise(where);
  } catch (e) {
    console.error('Failed to retrieve users due to a server error: ', e);
    return {
      error:
        'Failed to retrieve users due to a server error. Please try again later',
    };
  }
};

const participantPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: {
      organizations: { select: { organizationId: true } },
      CompletedPrograms: { select: { programId: true } },
    },
  });
type ParticipantPromise = Awaited<ReturnType<typeof participantPromise>>;

type GetProgramOptionsReturn = { error: string } | ProgramsOptionsPromise;
export const getProgramOptions = async (
  // id being the participant Id;
  id?: string,
  selectedProgramId?: string,
): Promise<GetProgramOptionsReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to view other participants' };

  let user: UserPromise, participant: ParticipantPromise | undefined;
  try {
    [user, participant] = await Promise.all([
      userPromise(userId),
      id ? participantPromise(id) : Promise.resolve(undefined),
    ]);
  } catch (e) {
    console.error('Failed to authenticate request due to a server error: ', e);
    return {
      error:
        'Failed to authenticate request due to a server error. Please try again later',
    };
  }

  if (!user)
    return {
      error:
        'Failed to authenticate request because your account was not found',
    };

  let where: Prisma.ProgramWhereInput = {};

  if (participant) {
    where = {
      id: {
        notIn: participant.CompletedPrograms.map(
          ({ programId }) => programId,
        ).filter((programId) => programId !== selectedProgramId),
      },
    };
  }

  try {
    return await programsOptionsPromise(where);
  } catch (error) {
    console.error('Failed to fetch programs due to a server error: ', error);
    return {
      error:
        'Failed to fetch programs due to a server error. Please try again later',
    };
  }
};

const completedPromise = async (id: string) =>
  await db.completedProgram.findUnique({
    where: { id },
    select: {
      id: true,
      programId: true,
      completionEvidence: true,
      completionDate: true,
      participantId: true,
      participant: {
        select: { organizations: { select: { organizationId: true } } },
      },
    },
  });
type CompletedPromise = Awaited<ReturnType<typeof completedPromise>>;

export type CompletedProgramUpdate = UpdateCompletedSchema & {
  previews: FilePreviewSchema[];
};
type GetCompletedEvidenceReturn = { error: string } | CompletedProgramUpdate;

export const getCompletedEvidence = async (
  // id here being of the completedProgram
  id: string,
): Promise<GetCompletedEvidenceReturn> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You need to login first.' };

  let user: UserPromise, completedProgram: CompletedPromise;
  try {
    [user, completedProgram] = await Promise.all([
      userPromise(userId),
      completedPromise(id),
    ]);
  } catch (e) {
    console.error('Failed to authenticate request due to a server error: ', e);
    return {
      error:
        'Failed to authenticate request due to a server error. Please try again later',
    };
  }
  if (!user)
    return { error: 'Failed to authenticate request due to a server error.' };
  if (!completedProgram) return { error: 'Completed program not found' };

  const sameUserParticipant = user.id === completedProgram.participantId;
  const ownsOrg = user.organizations.some(({ organizationId }) =>
    completedProgram?.participant.organizations.some(
      (org) => org.organizationId === organizationId,
    ),
  );
  const isAdmin = user.role === UserRole.ADMIN;
  if (!isAdmin && !sameUserParticipant && !ownsOrg)
    return {
      error:
        'You are not authorized to view the details of this completed program',
    };

  const { programId, completionDate, participantId, completionEvidence } =
    completedProgram;

  return {
    id: id,
    programId: programId,
    completionDate: completionDate,
    participantId: participantId,
    previews: completionEvidence.map((completion) => ({
      fileName: path.basename(completion.filePath),
      fileSize: completion.size,
      fileType: completion.contentType,
      fileUrl: completion.fileUrl,
      filePath: completion.filePath,
    })),
  };
};
