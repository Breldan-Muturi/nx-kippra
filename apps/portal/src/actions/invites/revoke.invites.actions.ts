'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationRole } from '@prisma/client';

const userPromise = async ({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      organizations: {
        where: { AND: [{ role: OrganizationRole.OWNER }, { organizationId }] },
        take: 1,
      },
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

export const revokeInvite = async ({
  ids,
  organizationId,
}: {
  ids: string[];
  organizationId: string;
}) => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You need to be logged in to revoke invites' };

  let user: UserPromise;
  try {
    user = await userPromise({ id: userId, organizationId });
  } catch (error) {
    console.error(
      'Failed to authenticate request due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to revoke invites due to a server error. Please try again later',
    };
  }

  try {
    await db.inviteOrganization.deleteMany({
      where: { AND: [{ id: { in: ids } }, { organizationId }] },
    });
    return {
      success: `Invite${ids.length > 1 ? 's' : ''} revoked successfully`,
    };
  } catch (error) {
    console.error('Failed to revoke invite due to a server error: ', error);
    return {
      error:
        'Failed to revoke invites due to a server error. Please try again later',
    };
  }
};
