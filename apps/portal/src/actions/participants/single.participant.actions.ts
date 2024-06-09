'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const getApplicationParticipant = async (participantId: string) => {
  return await db.user.findUnique({
    where: { id: participantId },
    include: {
      image: { select: { fileUrl: true } },
      organizations: true,
      applications: true,
      ownedApplications: true,
    },
  });
};
export type SingleApplicationParticipant = NonNullable<
  Awaited<ReturnType<typeof getApplicationParticipant>>
>;

export type GetSingleParticipantReturn =
  | { error: string }
  | { participant: SingleApplicationParticipant };
export const getSingleParticipant = async (
  participantId: string,
): Promise<GetSingleParticipantReturn> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'Log in to view participant information' };
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      organizations: { select: { organizationId: true } },
    },
  });
  if (!existingUser || !existingUser.id)
    return {
      error: "You are not authorized to view this participant's details",
    };
  try {
    const participant = await getApplicationParticipant(participantId);
    if (!participant)
      return {
        error:
          "This participant's details could not be found, please try again later.",
      };
    const fromSameOrganization = participant.organizations.some(
      ({ organizationId }) =>
        existingUser.organizations
          .map(
            ({ organizationId: existingUserOrganization }) =>
              existingUserOrganization,
          )
          .includes(organizationId),
    );
    if (existingUser.role !== UserRole.ADMIN && !fromSameOrganization) {
      return {
        error:
          "You must be an Admin, or share organizations, to view this participant's details",
      };
    }
    return { participant };
  } catch (error) {
    console.error('Error fetching participant: ', error);
    return {
      error:
        "There was an error fetching this participant's details, please try again later",
    };
  }
};
