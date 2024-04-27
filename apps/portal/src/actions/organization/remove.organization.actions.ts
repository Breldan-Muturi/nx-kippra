'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnType } from '@/types/actions.types';
import { SelectOptions } from '@/types/form-field.types';
import { RemoveOrgInfo } from '@/validation/organization/organization.validation';
import { OrganizationRole } from '@prisma/client';

const getExistingUser = async ({
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
      email: true,
      organizations: { where: { organizationId }, select: { role: true } },
    },
  });
type OrgUser = Awaited<ReturnType<typeof getExistingUser>>;

const getExistingOrganization = async (id: string) =>
  await db.organization.findUnique({
    where: { id },
    select: {
      id: true,
      invites: true,
    },
  });
type RemoveOrgOrganization = Awaited<
  ReturnType<typeof getExistingOrganization>
>;

type RemoveOrganizationParams = RemoveOrgInfo & { id: string };
export const removeOrganization = async ({
  id,
  newEmail,
  newName,
  newOwnerId,
}: RemoveOrganizationParams): Promise<ActionReturnType> => {
  const userId = await currentUserId();
  if (!userId)
    return {
      error:
        'Failed to delete the organization due to a server error, please try again later',
    };

  // Confirm the existing user, and existing organization
  let existingUser: OrgUser,
    existingOrganization: RemoveOrgOrganization,
    newOwner: OrgUser | undefined;
  try {
    [existingUser, existingOrganization, newOwner] = await Promise.all([
      getExistingUser({ id: userId, organizationId: id }),
      getExistingOrganization(id),
      newOwnerId
        ? getExistingUser({ id: newOwnerId, organizationId: id })
        : Promise.resolve(undefined),
    ]);
  } catch (error) {
    console.error('Error validating params: ', error);
    return {
      error:
        'Failed to verify request params due to a server error. Please try again later',
    };
  }

  if (!existingUser)
    return { error: 'Account details not found, please try again later.' };

  if (!existingOrganization)
    return { error: 'Organization not found. Please try again later.' };

  if (existingUser.organizations.length < 1)
    return {
      error:
        'You are not a member of this organization. Please confirm and try again later.',
    };

  if (newOwnerId && !newOwner)
    return { error: 'New owner details not found. Please check and try again' };

  if (newOwner && newOwner.organizations.length < 1)
    return {
      error:
        'The provided new owner is not a part of this organization. Please confirm and try again later.',
    };

  // If the user is the owner and no new owner is provided, delete the organization: stop here
  if (
    !newOwner &&
    existingUser.organizations[0].role === OrganizationRole.OWNER
  )
    return {
      error:
        'Failed to delete the organization due to a server error, please try again later',
    };

  // Remove any invites the user has
  const invites = existingOrganization.invites.filter(
    (invites) => invites !== existingUser?.email,
  );

  // If the user is the owner and a new owner is passed update the organization owner
  try {
    await db.$transaction(
      async (prisma) => {
        await Promise.all([
          // Remove the user as a participant in this organization
          prisma.applicationParticipant.deleteMany({
            where: {
              userId: existingUser?.id,
              organizationId: existingOrganization?.id,
            },
          }),
          prisma.userOrganization.deleteMany({
            where: {
              userId: existingUser?.id,
              organizationId: existingOrganization?.id,
            },
          }),
          newOwner
            ? prisma.userOrganization.updateMany({
                where: {
                  userId: newOwner.id,
                  organizationId: existingOrganization?.id,
                },
                data: { role: OrganizationRole.OWNER },
              })
            : Promise.resolve(undefined),
        ]);
        await db.organization.update({
          where: { id: existingOrganization?.id },
          data: {
            invites,
            contactPersonEmail: newEmail,
            contactPersonName: newName,
          },
        });
      },
      { maxWait: 20000, timeout: 200000 },
    );
    return {
      success: 'You have been removed from this organization successfully',
    };
  } catch (error) {
    console.error('Error updating organization: ', error);
    return {
      error:
        'Failed to update the organization due to a server error. Please try again later',
    };
  }
  // Send an email confirmation that the user is removed
};

const getPopupUser = async ({
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
      email: true,
      name: true,
      organizations: { where: { organizationId }, select: { role: true } },
    },
  });
type PopupUser = Awaited<ReturnType<typeof getPopupUser>>;

const getPopupOrganization = async (id: string) =>
  await db.organization.findUnique({
    where: { id },
    select: {
      id: true,
      invites: true,
      contactPersonEmail: true,
      contactPersonName: true,
      users: {
        select: {
          userId: true,
          user: { select: { email: true, name: true, image: true } },
        },
      },
    },
  });
type PopupOrganization = Awaited<ReturnType<typeof getPopupOrganization>>;

export type RemovePopupOwnerOption = SelectOptions & {
  email: string;
  image?: string;
};

export type RemoveOrgData = {
  orgId: string;
  updateEmail?: boolean;
  updateName?: boolean;
  otherOrgUsers?: RemovePopupOwnerOption[];
  deleteOrg?: boolean;
};
type PopupReturn = { error: string } | RemoveOrgData;

export const removeOrganizationPopup = async (
  id: string,
): Promise<PopupReturn> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'First log in to continue' };

  let popupUser: PopupUser, popupOrganization: PopupOrganization;
  try {
    [popupUser, popupOrganization] = await Promise.all([
      getPopupUser({ id: userId, organizationId: id }),
      getPopupOrganization(id),
    ]);
  } catch (error) {
    console.error('Error validating input: ', error);
    return {
      error:
        'There was an error validating your permissions, please try again later',
    };
  }

  if (!popupUser)
    return { error: 'Account details not found, please try again later.' };

  if (!popupOrganization)
    return { error: 'Organization not found. Please try again later.' };

  if (popupUser.organizations.length < 1)
    return {
      error:
        'You are not a member of this organization. Please confirm and try again later.',
    };

  if (popupUser.organizations[0].role !== OrganizationRole.OWNER)
    return {
      updateEmail:
        popupOrganization.contactPersonEmail === popupUser.email
          ? true
          : undefined,
      updateName:
        popupOrganization.contactPersonName === popupUser.name
          ? true
          : undefined,
      orgId: id,
    };

  if (popupOrganization.users.length > 2)
    return {
      otherOrgUsers: popupOrganization.users
        .filter(({ userId }) => userId !== popupUser?.id)
        .map(({ userId, user }) => ({
          value: userId,
          optionLabel: user.name,
          image: user.image || undefined,
          email: user.email,
        })),
      orgId: id,
    };

  return {
    deleteOrg: true,
    orgId: id,
  };
};
