'use server';

import { processSearchString } from '@/helpers/filter.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  FetchInvitesSchema,
  PathInvitesSchema,
  fetchInvitesSchema,
  pathInvitesSchema,
} from '@/validation/organization/organization.invites.validation';
import { OrganizationRole, Prisma, UserRole } from '@prisma/client';
import filterRedirect from '../redirect.actions';

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
      role: true,
      organizations: {
        where: { organizationId },
        select: { role: true },
        take: 1,
      },
    },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const invitesPromise = async (
  where: Prisma.InviteOrganizationWhereInput,
  page: string,
  pageSize: string,
) =>
  await db.inviteOrganization.findMany({
    where,
    select: { id: true, email: true, expires: true, createdAt: true },
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
  });
type InvitesPromise = Awaited<ReturnType<typeof invitesPromise>>;
export type SingleInviteDetail = InvitesPromise[number];

export type FetchOrganizationInvites = {
  organizationId: string;
  fetchParams: FetchInvitesSchema;
};

export type InvitesTableProps = FetchOrganizationInvites & {
  orgInvites: InvitesPromise;
  count: number;
};

type FetchInvitesReturn = { error: string } | InvitesTableProps;

export const fetchOrganizationInvites = async ({
  organizationId,
  fetchParams,
}: FetchOrganizationInvites): Promise<FetchInvitesReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to view organization invites' };

  let where: Prisma.InviteOrganizationWhereInput = {
    organizationId,
  };
  const validFetch = fetchInvitesSchema.safeParse(fetchParams);
  if (!validFetch.success) {
    console.error('Invalid search terms: ', validFetch.error);
    return { error: 'Invalid search terms, please try again later' };
  }
  const { email, page, pageSize } = validFetch.data;
  const searchEmail = email ? processSearchString(email) : undefined;
  if (searchEmail) where.email = { search: searchEmail };

  let existingUser: UserPromise, orgInvites: InvitesPromise, count: number;
  try {
    [existingUser, orgInvites, count] = await Promise.all([
      userPromise({ id: userId, organizationId }),
      invitesPromise(where, page, pageSize),
      db.inviteOrganization.count({ where }),
    ]);
  } catch (error) {
    console.error(
      'Failed to fetch organization invites due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to fetch organization invites due to a server error. Please try again later',
    };
  }

  if (!existingUser || !existingUser.id || !existingUser.role)
    return {
      error:
        'Failed to authenitcate request because this account does not exist. Please try again later',
    };

  if (
    existingUser.role !== UserRole.ADMIN &&
    existingUser.organizations[0].role !== OrganizationRole.OWNER
  )
    return {
      error: "You are not authorized to view this organization's participants",
    };

  return {
    organizationId,
    fetchParams: validFetch.data,
    count,
    orgInvites,
  };
};

export const filterInvites = async (values: PathInvitesSchema) =>
  await filterRedirect(values, pathInvitesSchema, values.path);
