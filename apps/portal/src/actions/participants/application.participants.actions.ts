'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationRole, UserRole } from '@prisma/client';

type FetchOrganizationParticipantsProps = {
  organizationId: string;
  trainingSessionId: string;
};

const fetchParticipants = async ({
  organizationId,
  trainingSessionId,
}: FetchOrganizationParticipantsProps) =>
  await db.user.findMany({
    where: { organizations: { some: { organizationId } } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      citizenship: true,
      nationalId: true,
      _count: {
        select: {
          applications: { where: { application: { trainingSessionId } } },
        },
      },
    },
  });
export type DynamicParticipantOption = NonNullable<
  Awaited<ReturnType<typeof fetchParticipants>>
>[number];

type FetchOrganizationParticipantsReturn =
  | { error: string }
  | { participantOptions: DynamicParticipantOption[] };

export const fetchOrganizationParticipants = async ({
  organizationId,
  trainingSessionId,
}: FetchOrganizationParticipantsProps): Promise<FetchOrganizationParticipantsReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You must be logged in to submit this application' };

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      organizations: {
        where: { role: OrganizationRole.OWNER },
        select: { organizationId: true },
      },
    },
  });

  if (!existingUser)
    return { error: 'You are not authorized to submit this application' };
  if (
    existingUser.role !== UserRole.ADMIN &&
    !!!existingUser.organizations.find(
      ({ organizationId }) => organizationId === organizationId,
    )
  ) {
    return {
      error: 'Only admins and organization members can submit this application',
    };
  }
  try {
    const participantOptions = await fetchParticipants({
      organizationId,
      trainingSessionId,
    });
    return { participantOptions };
  } catch (error) {
    console.log('Error fetching organization participants: ', error);
    return { error: 'Error fetching organization participants' };
  }
};
