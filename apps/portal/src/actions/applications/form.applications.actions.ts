'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationRole, Prisma, UserRole } from '@prisma/client';
import {
  OrganizationPromise,
  organizationPromise,
} from '../organization/org.options.actions';
import {
  ProgramsOptionsPromise,
  programsOptionsPromise,
} from '../programmes/programs.options.actions';

const trainingSessionPromise = async (id: string) =>
  await db.trainingSession.findUnique({
    where: { id },
    select: {
      id: true,
      mode: true,
      program: {
        select: {
          id: true,
          title: true,
          prerequisites: {
            select: {
              title: true,
              id: true,
            },
          },
        },
      },
    },
  });
type TrainingSessionPromise = Awaited<
  ReturnType<typeof trainingSessionPromise>
>;
export type TrainingSessionInfo = NonNullable<TrainingSessionPromise>;

export type FormApplication = {
  orgOptions: OrganizationPromise;
  trainingSessionInfo?: TrainingSessionInfo;
  programOptions?: ProgramsOptionsPromise;
};

export const formApplication = async (
  id?: string,
): Promise<{ error: string } | FormApplication> => {
  const user = await currentUser();
  if (!user) return { error: 'Login to submit this application' };
  const isAdmin = user.role === UserRole.ADMIN;
  let organizationWhere: Prisma.OrganizationWhereInput | undefined;
  if (!isAdmin)
    organizationWhere = {
      users: {
        some: {
          AND: [{ userId: user.id }, { role: OrganizationRole.OWNER }],
        },
      },
    };

  let trainingSessionInfo: TrainingSessionPromise | undefined,
    orgOptions: OrganizationPromise,
    programOptions: ProgramsOptionsPromise | undefined;
  try {
    [trainingSessionInfo, orgOptions, programOptions] = await Promise.all([
      id ? trainingSessionPromise(id) : Promise.resolve(undefined),
      organizationPromise(organizationWhere),
      isAdmin && !id ? programsOptionsPromise() : Promise.resolve(undefined),
    ]);
  } catch (e) {
    console.error(
      'Failed to fetch application details due to a server error:',
      e,
    );
    return {
      error:
        'Failed to fetch application details due to a server error. Please try again later',
    };
  }

  if (!!id && !trainingSessionInfo)
    return {
      error:
        'Failed to load program details for this training session. Please try again later',
    };

  return {
    trainingSessionInfo: !!trainingSessionInfo
      ? trainingSessionInfo
      : undefined,
    programOptions,
    orgOptions,
  };
};
