'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { inviteResendEmail } from '@/mail/organization.mail';
import { ActionReturnType } from '@/types/actions.types';
import { OrganizationRole, UserRole } from '@prisma/client';

const invitesPromise = async (ids: string[]) =>
  await db.inviteOrganization.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true, token: true },
  });
type InvitesPromise = Awaited<ReturnType<typeof invitesPromise>>;

const organizationPromise = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) =>
  await db.organization.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      users: {
        where: { AND: [{ role: OrganizationRole.OWNER }, { userId }] },
        select: { userId: true },
        take: 1,
      },
    },
  });
type OrganizationPromise = Awaited<ReturnType<typeof organizationPromise>>;

const registeredUsersPromise = async (emails: string[]) =>
  await db.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
type RegisteredUsersPromise = Awaited<
  ReturnType<typeof registeredUsersPromise>
>;

const invitesResend = async ({
  organizationId,
  inviteIds,
}: {
  organizationId: string;
  inviteIds: string[];
}): Promise<ActionReturnType> => {
  const user = await currentUser();
  if (!user || !user.id || !user.name)
    return { error: 'You must be logged in to resend invites' };
  let invitesResend: InvitesPromise = [],
    organization: OrganizationPromise | undefined;
  try {
    [invitesResend, organization] = await Promise.all([
      invitesPromise(inviteIds),
      organizationPromise({ id: organizationId, userId: user?.id }),
    ]);
  } catch (e) {
    console.error('Failed to validate request due to a server error: ', e);
    return {
      error:
        'Could not complete this request due to a server error. Please try again later',
    };
  }

  if (!organization)
    return {
      error:
        'This organization no longer exists. Please refresh the page and try again',
    };

  if (
    user.role !== UserRole.ADMIN &&
    (organization?.users.length < 1 || organization.users[0].userId !== user.id)
  ) {
    return { error: 'You are not authorized to resend these invites' };
  }

  if (invitesResend.length < 1)
    return {
      error:
        'We could not find any matching invite ids. Please refresh the page and try again',
    };

  let registeredUsers: RegisteredUsersPromise = [];
  try {
    [, registeredUsers] = await Promise.all([
      db.inviteOrganization.updateMany({
        where: { id: { in: invitesResend.map(({ id }) => id) } },
        data: {
          expires: new Date(new Date().getTime() + 15 * 24 * 3600 * 1000),
        },
      }),
      registeredUsersPromise(invitesResend.map(({ email }) => email)),
    ]);
  } catch (e) {
    console.error('Failed to resend invites due to a server error: ', e);
    return {
      error:
        'Failed to resend invites due to a server error. Please try again later',
    };
  }

  try {
    await Promise.all(
      invitesResend.map(async (invite) => {
        const isRegistered = registeredUsers.some(
          ({ email }) => email === invite.email,
        );
        await inviteResendEmail({
          to: invite.email,
          token: invite.token,
          organizationName: organization?.name!,
          senderName: user?.name!,
          inviteRoute: isRegistered ? 'organizations' : 'account/register',
        });
      }),
    );
    return { success: 'Invites resent successfully' };
  } catch (e) {
    console.error(
      "Invites are updated, but we didn't trigger email notifications successfully: ",
      e,
    );
    return {
      error:
        'Invites updated successfully. However, we were unable to send email notifications to the invitees due to a server error.',
    };
  }
};

export default invitesResend;
