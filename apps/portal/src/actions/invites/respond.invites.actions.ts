'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { inviteResponseEmail } from '@/mail/organization.mail';
import { ActionReturnType } from '@/types/actions.types';
import { OrganizationRole } from '@prisma/client';

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const invitePromise = async (id: string) =>
  await db.inviteOrganization.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      expires: true,
      organizationId: true,
      organization: {
        select: {
          name: true,
          users: {
            where: { role: OrganizationRole.OWNER },
            select: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });
type InvitePromise = Awaited<ReturnType<typeof invitePromise>>;

export const respondInvite = async ({
  accepted,
  id,
}: {
  accepted: boolean;
  id: string;
}): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId)
    return {
      error: `You need to be logged in to ${accepted ? 'accept' : 'decline'} this invitation`,
    };
  // Fetch the user information and the invite information
  let user: UserPromise, invite: InvitePromise;
  try {
    [user, invite] = await Promise.all([
      userPromise(userId),
      invitePromise(id),
    ]);
  } catch (error) {
    console.error(
      `Failed to ${accepted ? 'accept' : 'decline'} invite due to a server error: `,
      error,
    );
    return {
      error: `Failed to ${accepted ? 'accept' : 'decline'} invite due to a server error. Please try again later`,
    };
  }

  // Check whether the invite and user information are valid.
  if (!user) return { error: 'User not found. Please try again later' };
  if (!invite)
    return { error: 'This invite does not exist. Please try again later' };
  if (user.email !== invite.email)
    return {
      error:
        'This invite email does not match your email. Please try again later',
    };
  if (invite.expires < new Date())
    return {
      error:
        'This invite is expired. Please contact the organization admin to resend the invite',
    };

  // Process the invitations response;
  try {
    await db.$transaction(
      async (prisma) => {
        if (accepted) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              organizations: {
                create: {
                  role: OrganizationRole.MEMBER,
                  organizationId: invite.organizationId,
                },
              },
            },
          });
        }
        await prisma.inviteOrganization.delete({ where: { id: invite.id } });
      },
      { maxWait: 20000, timeout: 20000 },
    );
  } catch (error) {
    console.error(
      `Failed to ${accepted ? 'accept' : 'decline'} this invite due to a server error: `,
      error,
    );
    return {
      error: `Failed to ${accepted ? 'accept' : 'decline'} this invite due to a server error. Please try again later`,
    };
  }

  // Send notification
  try {
    await inviteResponseEmail({
      to: invite.organization.users[0].user.email,
      inviteeName: user.name,
      organizationName: invite.organization.name,
      organizationId: invite.organizationId,
      accepted,
    });
    return {
      success: `Invitation ${accepted ? 'accepted' : 'declined'} successfully`,
    };
  } catch (error) {
    console.error(
      'Failed to notify the organization admin due to a server error: ',
      error,
    );
    return {
      error: 'Failed to notify the organization admin due to a server error.',
    };
  }
};
