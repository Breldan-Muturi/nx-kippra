'use server';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      ownedApplications: { select: { id: true } },
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const applicationPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: { select: { id: true, image: { select: { fileUrl: true } } } },
        },
      },
      organization: {
        select: {
          id: true,
          image: { select: { fileUrl: true } },
          name: true,
          email: true,
          phone: true,
        },
      },
      trainingSession: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          program: { select: { title: true, code: true } },
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phoneNumber: true,
        },
      },
    },
  });
type ApplicationPromise = Awaited<ReturnType<typeof applicationPromise>>;
export type ViewColumnParticipant =
  NonNullable<ApplicationPromise>['participants'][number];

const applicationDetailsPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    select: {
      proformaInvoice: true,
      offerLetter: true,
      payment: {
        include: {
          payment_references: true,
          paymentReceipt: true,
        },
      },
      invoice: true,
    },
  });
type ApplicationDetailsPromise = Awaited<
  ReturnType<typeof applicationDetailsPromise>
>;

export type ViewApplicationSheet = NonNullable<ApplicationPromise> & {
  authorizedInfo?: ApplicationDetailsPromise;
};

export const getApplicationByIdPromise = async (
  id: string,
): Promise<{ error: string } | ViewApplicationSheet> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You must be logged in to view applications' };

  let user: UserPromise;
  try {
    user = await userPromise(userId);
  } catch (e) {
    console.error('Failed to fetch user info due to a server error: ', e);
    return {
      error:
        'Failed to authorize request due to a server error. Please try again later',
    };
  }

  if (!user)
    return {
      error:
        'Failed to authorize request due to a server error. Please try again later',
    };

  const isAuthorized =
    user.role === UserRole.ADMIN ||
    user.ownedApplications.map(({ id }) => id).includes(id);

  let application: ApplicationPromise,
    authorizedInfo: ApplicationDetailsPromise | undefined;
  try {
    [application, authorizedInfo] = await Promise.all([
      applicationPromise(id),
      isAuthorized ? applicationDetailsPromise(id) : Promise.resolve(undefined),
    ]);
  } catch (e) {
    console.error(
      'Failed to retrieve application info due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to retrieve application info due to a server error. Please try again later',
    };
  }

  if (!application || (isAuthorized && !authorizedInfo))
    return {
      error:
        'This application no longer exists, please refresh your page and try again',
    };

  return { ...application, authorizedInfo };
};
