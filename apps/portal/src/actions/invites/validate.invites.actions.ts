'use server';

import { db } from '@/lib/db';
import { OrganizationRole } from '@prisma/client';

const invitePromise = async (token: string) =>
  await db.inviteOrganization.findFirst({
    where: { token },
    select: {
      id: true,
      createdAt: true,
      expires: true,
      email: true,
      token: true,
      organization: {
        select: {
          name: true,
          image: true,
          users: {
            where: { role: OrganizationRole.OWNER },
            select: { user: { select: { name: true } } },
          },
        },
      },
    },
  });
type InvitePromise = Awaited<ReturnType<typeof invitePromise>>;

export type ValidateInvite =
  | { error: string }
  | { invite: InvitePromise }
  | { invalid: true };

export const validateInvite = async (
  token: string,
): Promise<ValidateInvite> => {
  let invite: InvitePromise;
  try {
    invite = await invitePromise(token);
  } catch (error) {
    console.error('Error validating this invite token: ', error);
    return {
      error:
        'Failed to validate this invite token due to a server error. Please try again later',
    };
  }

  if (!invite) return { invalid: true };

  return { invite };
};
