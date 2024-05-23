'use server';

import { processSearchString } from '@/helpers/filter.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  FetchCompletedSchema,
  PathCompletedSchema,
  fetchCompletedSchema,
  pathCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { OrganizationRole, Prisma, UserRole } from '@prisma/client';
import filterRedirect from '../redirect.actions';

const userPromise = async ({
  id,
  organizationId,
}: {
  id: string;
  organizationId?: string;
}) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      organizations: {
        where: { role: OrganizationRole.OWNER },
        select: { organizationId: true },
      },
      _count: organizationId
        ? {
            select: {
              organizations: {
                where: {
                  AND: [{ organizationId }, { role: OrganizationRole.OWNER }],
                },
              },
            },
          }
        : undefined,
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;
export type CompletedProgramsUser = NonNullable<UserPromise>;

const completedPromise = async ({
  where,
  page,
  pageSize,
}: {
  where: Prisma.CompletedProgramWhereInput;
  page: string;
  pageSize: string;
}) =>
  await db.completedProgram.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select: {
      id: true,
      status: true,
      completionDate: true,
      updatedAt: true,
      participant: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          organizations: { select: { organizationId: true } },
        },
      },
      program: { select: { id: true, title: true, code: true } },
    },
  });
type CompletedPromise = Awaited<ReturnType<typeof completedPromise>>;
export type SingleCompletedProgram = CompletedPromise[number];

export type FetchCompletedPrograms =
  | FetchCompletedSchema
  | (FetchCompletedSchema & { organizationId: string })
  | (FetchCompletedSchema & { programId: string });

export type TableCompleted = {
  fetchParams: FetchCompletedSchema;
  existingUser: CompletedProgramsUser;
  completedPrograms: CompletedPromise;
  count: number;
};

export type FetchCompletedReturn = { error: string } | TableCompleted;

export const fetchCompletedPrograms = async (
  fetchParams: FetchCompletedPrograms,
): Promise<FetchCompletedReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'Only logged in users can access completed programs' };
  const organizationId =
    'organizationId' in fetchParams ? fetchParams.organizationId : undefined;
  const programId =
    'programId' in fetchParams ? fetchParams.programId : undefined;

  const validParams = fetchCompletedSchema.safeParse(fetchParams);
  if (!validParams.success) {
    console.error(
      'Invalid completed courses search params: ',
      validParams.error,
    );
    return { error: 'Invalid completed courses search params' };
  }

  const {
    page,
    pageSize,
    organizationName,
    participantName,
    programName,
    status,
  } = validParams.data;

  let where: Prisma.CompletedProgramWhereInput = {
    programId,
    participant: { organizations: { some: { organizationId } } },
  };

  if (status) where.status = status;

  const searchOrganizationName =
    !organizationId && organizationName
      ? processSearchString(organizationName)
      : undefined;
  if (searchOrganizationName)
    where.participant = {
      organizations: {
        some: { organizationId: { search: searchOrganizationName } },
      },
    };

  const searchParticipantName = participantName
    ? processSearchString(participantName)
    : undefined;
  if (searchParticipantName)
    where.participant = { name: { search: searchParticipantName } };

  const searchProgramName = programName;
  !programId && programName ? processSearchString(programName) : undefined;
  if (searchProgramName)
    where.program = { title: { search: searchProgramName } };

  // TODO: Add date filters;
  let existingUser: UserPromise,
    completedPrograms: CompletedPromise,
    count: number;
  try {
    [existingUser, completedPrograms, count] = await Promise.all([
      userPromise({ id: userId, organizationId }),
      completedPromise({ where, page, pageSize }),
      db.completedProgram.count({ where }),
    ]);
  } catch (error) {
    console.error(
      'Failed to retrieve completed courses due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to retrieve completed courses due to a server error. Please try again later.',
    };
  }

  if (!existingUser)
    return {
      error:
        'Failed to authenticate request because this account does not exist. Please try again later',
    };

  if (
    existingUser.role !== UserRole.ADMIN &&
    !!organizationId &&
    existingUser._count.organizations < 1
  )
    return {
      error:
        "You are not authorized to view this organization's completed programs",
    };

  return {
    fetchParams,
    existingUser,
    completedPrograms,
    count,
  };
};

export const filterCompleted = async (values: PathCompletedSchema) => {
  await filterRedirect(values, pathCompletedSchema, values.path);
};
