'use server';

import { processSearchString } from '@/helpers/filter.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  OrganizationPathSchema,
  OrganizationTableSchema,
  organizationPathSchema,
  organizationsTableSchema,
} from '@/validation/organization/organization.validation';
import { Prisma, UserRole } from '@prisma/client';
import filterRedirect from '../redirect.actions';

const getExistingUser = async (userId: string) =>
  await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, name: true },
  });
export type OrganizationTableUser = NonNullable<
  Awaited<ReturnType<typeof getExistingUser>>
>;

const organizationsPromise = async (
  email: string,
  hiddenColumnsArray: string[],
  where: Prisma.OrganizationWhereInput,
  page: string,
  pageSize: string,
) => {
  const showUsers =
    hiddenColumnsArray.includes('Role') && hiddenColumnsArray.includes('Owner')
      ? undefined
      : true;
  const showContact = hiddenColumnsArray.includes('Role') ? undefined : true;
  const showCount =
    !hiddenColumnsArray.includes('Users') ||
    !hiddenColumnsArray.includes('Participants') ||
    !hiddenColumnsArray.includes('Applications');

  return await db.organization.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select: {
      id: true,
      name: true,
      email: true,
      contactPersonEmail: showContact,
      image: { select: { fileUrl: true } },
      invites: {
        where: { email },
        select: { email: true, token: true },
        take: 1,
      },
      users: {
        select: {
          role: showUsers,
          user: {
            select: {
              image: { select: { fileUrl: showUsers } },
              email: showUsers,
              name: showUsers,
              id: true,
            },
          },
        },
      },
      _count: showCount
        ? {
            select: {
              users: hiddenColumnsArray.includes('Users') ? undefined : true,
              participants: hiddenColumnsArray.includes('Participants')
                ? undefined
                : true,
              applications: hiddenColumnsArray.includes('Applications')
                ? undefined
                : true,
            },
          }
        : undefined,
    },
  });
};
export type OrganizationsTableData = Awaited<
  ReturnType<typeof organizationsPromise>
>;
export type SingleOrganizationDetail = OrganizationsTableData[number];
export type FetchOrganizationsTable = {
  organizations: OrganizationsTableData;
  count: number;
  existingUser: OrganizationTableUser;
};
export type FetchOrgTableReturn = { error: string } | FetchOrganizationsTable;

export const fetchOrganizationsTable = async (
  params: OrganizationTableSchema,
): Promise<FetchOrgTableReturn> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to access organizations.' };

  const validParams = organizationsTableSchema.safeParse(params);
  if (!validParams.success)
    return { error: 'Invalid organization search params' };

  const existingUser = await getExistingUser(userId);

  if (!existingUser || !existingUser.id || !existingUser.role)
    return { error: 'You are not authorized to access organizations' };

  let userCondition: Prisma.OrganizationWhereInput = {};
  if (existingUser.role !== UserRole.ADMIN) {
    userCondition = {
      OR: [
        { participants: { some: { id: existingUser.id } } },
        { users: { some: { userId: existingUser.id } } },
        { contactPersonEmail: existingUser.email },
        { invites: { some: { email: existingUser.email } } },
        { contactPersonName: existingUser.name },
      ],
    };
  }

  const {
    page,
    pageSize,
    address,
    county,
    name,
    contactEmail,
    role,
    hiddenColumns,
  } = validParams.data;

  let filterCondition: Prisma.OrganizationWhereInput = {};

  const searchName = name ? processSearchString(name) : undefined;
  const searchAddress = address ? processSearchString(address) : undefined;
  const searchCounty = county ? processSearchString(county) : undefined;

  if (searchName) filterCondition.name = { search: searchName };
  if (searchAddress) filterCondition.address = { search: searchAddress };
  if (searchCounty) filterCondition.county = { search: searchCounty };
  if (contactEmail)
    filterCondition = {
      ...filterCondition,
      OR: [
        { invites: { some: { email: contactEmail } } },
        { participants: { some: { email: contactEmail } } },
        { contactPersonEmail: contactEmail },
        { users: { some: { user: { email: contactEmail } } } },
        { email: contactEmail },
      ],
    };
  if (role)
    filterCondition.users = {
      some: {
        userId: existingUser.id,
        role,
      },
    };

  const hiddenColumnsArray = hiddenColumns ? hiddenColumns.split(',') : [];

  try {
    const [organizations, count] = await Promise.all([
      organizationsPromise(
        existingUser.email,
        hiddenColumnsArray,
        {
          ...userCondition,
          ...filterCondition,
        },
        page,
        pageSize,
      ),
      db.organization.count({ where: userCondition }),
    ]);
    return { organizations, count, existingUser };
  } catch (error) {
    console.error('Error fetching organizations: ', error);
    return {
      error:
        'Failed to fetch organizations due to a server error. Please try again later',
    };
  }
};

export const filterOrganizations = async (values: OrganizationPathSchema) => {
  await filterRedirect(values, organizationPathSchema, values.path);
};
