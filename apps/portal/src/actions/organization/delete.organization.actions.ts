'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnType } from '@/types/actions.types';
import { OrganizationRole, UserRole } from '@prisma/client';

const getExistingUser = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
type DeleteOrgUser = Awaited<ReturnType<typeof getExistingUser>>;

const getExistingOrganization = async (id: string) =>
  await db.organization.findUnique({
    where: { id },
    select: { id: true, users: true },
  });
type DeleteOrgUsers = Awaited<ReturnType<typeof getExistingOrganization>>;

export const deleteOrganization = async (
  orgId: string,
): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You must be logged in to delete an organization' };

  let existingUser: DeleteOrgUser, existingOrgUsers: DeleteOrgUsers;
  try {
    [existingUser, existingOrgUsers] = await Promise.all([
      getExistingUser(userId),
      getExistingOrganization(orgId),
    ]);
  } catch (error) {
    console.error('Error validating credentials: ', error);
    return { error: 'Failed to validate request due to a server error' };
  }

  if (!existingUser || !existingUser.id || !existingUser.role)
    return {
      error:
        'Failed to confirm your account information. Please try again later',
    };

  if (!existingOrgUsers || !existingOrgUsers.users || !existingOrgUsers.id)
    return {
      error: 'Failed to verify organization details. Please try again later',
    };

  const isOrgAdmin = !!existingOrgUsers.users.find(
    ({ userId, role }) =>
      userId === existingUser?.id && role === OrganizationRole.OWNER,
  );

  if (existingUser.role !== UserRole.ADMIN && !isOrgAdmin) {
    return { error: 'You are not authorized to delete this organization' };
  }

  try {
    await db.$transaction(
      async (prisma) => {
        await prisma.userOrganization.deleteMany({
          where: { organizationId: existingOrgUsers?.id },
        });
        await prisma.organization.delete({
          where: { id: existingOrgUsers?.id },
        });
      },
      { maxWait: 20000, timeout: 200000 },
    );
    return { success: 'Organization deleted successfully' };
  } catch (error) {
    console.error('Error deleting organization: ', error);
    return {
      error:
        'Failed to delete organization due to a server error. Please try again later',
    };
  }

  //   Send an email to the organization owner, saying the organization has been deleted.
};
