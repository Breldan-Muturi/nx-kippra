'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { InviteOrganization, OrganizationRole, UserRole } from '@prisma/client';
import { inviteOrgTokenEmail } from '@/mail/organization.mail';
import { ActionReturnType } from '@/types/actions.types';

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

const invitePromise = async ({
  email,
  organizationId,
}: {
  email: string;
  organizationId: string;
}): Promise<number> =>
  await db.inviteOrganization.count({
    where: { AND: [{ email }, { organizationId }] },
  });

const registeredInvitePromise = async (email: string): Promise<number> =>
  await db.user.count({ where: { email } });

const organizationPromise = async ({
  id,
  email,
}: {
  id: string;
  email: string;
}) =>
  await db.organization.findUnique({
    where: { id },
    select: {
      name: true,
      users: {
        where: { user: { email } },
        select: { user: { select: { email: true } } },
        take: 1,
      },
    },
  });
type OrganizationPromise = Awaited<ReturnType<typeof organizationPromise>>;

type SendInvite = { email: string; organizationId: string };
export const sendInvite = async ({
  email,
  organizationId,
}: SendInvite): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'You need to be logged in to send invites' };

  let user: UserPromise,
    inviteCount: number,
    registeredInviteCount: number,
    organization: OrganizationPromise;
  try {
    [user, inviteCount, registeredInviteCount, organization] =
      await Promise.all([
        userPromise({ id: userId, organizationId }),
        invitePromise({ email, organizationId }),
        registeredInvitePromise(email),
        organizationPromise({ id: organizationId, email }),
      ]);
  } catch (error) {
    console.error('Failed to send invite due to a server error: ', error);
    return {
      error:
        'Failed to send invite due to a server error. Please try again later',
    };
  }

  console.debug('Is this email registered?', registeredInviteCount);

  if (!user)
    return {
      error:
        'Could not authenticate the request from this user. Please try again later',
    };
  if (
    user.role !== UserRole.ADMIN &&
    user.organizations[0].role !== OrganizationRole.OWNER
  )
    return { error: 'Not authorized to send invites for this organization' };

  if (inviteCount < 0)
    return {
      error:
        'An invite to this organization has already been sent to this email',
    };

  if (!organization)
    return {
      error:
        'Failed because a matching organization was not found. Please try again later',
    };

  if (organization.users[0].user.email === email)
    return {
      error: `There is an existing member with email ${email}. Please use a different invite email`,
    };

  let newInvite: InviteOrganization;
  try {
    newInvite = await db.inviteOrganization.create({
      data: {
        email,
        expires: new Date(new Date().getTime() + 15 * 24 * 3600 * 1000),
        token: uuidv4(),
        organizationId,
      },
    });
  } catch (error) {
    console.error('Failed to create new invite due to a server error: ', error);
    return {
      error:
        'Failed to send invite due to a server error. Please try again later',
    };
  }

  try {
    await inviteOrgTokenEmail({
      to: newInvite.email,
      organizationName: organization.name,
      inviteRoute:
        registeredInviteCount === 1 ? 'organizations' : 'account/register',
      senderName: user.name,
      token: newInvite.token,
    });
    return { success: 'Invite sent successfully' };
  } catch (error) {
    console.error(
      'Failed to send new invite email due to a server error: ',
      error,
    );
    return {
      error:
        'This invite was created but there was an error sending the invitation email. Please resend the invite',
    };
  }
};
