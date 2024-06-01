'use server';

import { db } from '@/lib/db';
import { ExtendedUser } from '@/types/next-auth';
import { Prisma, UserRole } from '@prisma/client';

const trainingSessionPromise = async (id: string) =>
  await db.trainingSession.findUnique({
    where: { id },
    include: {
      program: {
        select: { title: true, image: { select: { fileUrl: true } } },
      },
    },
  });
type TrainingSessionPromise = Awaited<
  ReturnType<typeof trainingSessionPromise>
>;

const applicationsPromise = async (where: Prisma.ApplicationWhereInput) =>
  await db.application.findMany({
    where,
    select: {
      submittedAt: true,
      id: true,
      owner: {
        select: {
          name: true,
          email: true,
          image: { select: { fileUrl: true } },
        },
      },
      participants: { select: { email: true } },
      invoice: { select: { invoiceEmail: true } },
    },
  });
type ApplicationsPromise = Awaited<ReturnType<typeof applicationsPromise>>;
export type TrainingSessionApplication = ApplicationsPromise[number];

export type SingleTrainingSession = NonNullable<TrainingSessionPromise> & {
  applications?: ApplicationsPromise;
};

export const singleTrainingSession = async ({
  id,
  user,
}: {
  id: string;
  user?: ExtendedUser;
}): Promise<SingleTrainingSession | { error: string }> => {
  let trainingSession: TrainingSessionPromise,
    applications: ApplicationsPromise | undefined;

  let where: Prisma.ApplicationWhereInput = {
    trainingSessionId: id,
  };

  if (user?.role === UserRole.USER) {
    where = {
      ...where,
      OR: [
        { ownerId: user.id },
        { participants: { some: { userId: user.id } } },
        user?.email ? { invoice: { some: { invoiceEmail: user.email } } } : {},
      ],
    };
  }

  try {
    [trainingSession, applications] = await Promise.all([
      trainingSessionPromise(id),
      user ? applicationsPromise(where) : Promise.resolve(undefined),
    ]);
  } catch (e) {
    console.error(
      'Failed to fetch training session info due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch training session info due to a server error. Please try again later',
    };
  }

  if (!trainingSession) {
    return {
      error:
        'The training session no longer exists. Please refresh your page, and try again',
    };
  }

  return { ...trainingSession, applications };
};
