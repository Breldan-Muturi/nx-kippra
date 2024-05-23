'use server';

import { processSearchString } from '@/helpers/filter.helpers';
import { db } from '@/lib/db';
import {
  FetchParticipantsType,
  PathParticipantsType,
  fetchParticipantsSchema,
  pathParticipantsSchema,
} from '@/validation/participants/participants.validation';
import { Prisma } from '@prisma/client';
import filterRedirect from '../redirect.actions';
import { currentUserId } from '@/lib/auth';

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
type UserPromise = Awaited<ReturnType<typeof userPromise>>;

const selectParticipantsPromise = async (
  hiddenColumnsArray: string[],
  where: Prisma.UserWhereInput,
  page: string,
  pageSize: string,
) =>
  await db.user.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select: {
      id: true,
      name: true,
      image: true,
      email: hiddenColumnsArray.includes('Email') ? undefined : true,
      role: true,
      userOrganization: true,
      citizenship: hiddenColumnsArray.includes('Citizenship')
        ? undefined
        : true,
      nationalId: hiddenColumnsArray.includes('National Id') ? undefined : true,
      phoneNumber: hiddenColumnsArray.includes('Phone number')
        ? undefined
        : true,
      organizations: hiddenColumnsArray.includes('Listed Organizations')
        ? undefined
        : {
            select: { organization: { select: { name: true } } },
          },
      _count: {
        select: {
          organizations: hiddenColumnsArray.includes('Listed Organizations')
            ? undefined
            : true,
          ownedApplications: hiddenColumnsArray.includes('Applications')
            ? undefined
            : true,
        },
      },
    },
  });
export type FetchedParticipantDetails = Awaited<
  ReturnType<typeof selectParticipantsPromise>
>;
export type SingleParticipantDetail = FetchedParticipantDetails[number];

export type ParticipantsTableProps = {
  participants: FetchedParticipantDetails;
  count: number;
  fetchParams: FetchParticipantsType;
};
export type FetchParticipantsReturnType =
  | { error: string }
  | ParticipantsTableProps;

export type FetchParticipants = {
  organizationId?: string;
  fetchParams: FetchParticipantsType;
};

export const fetchParticipantsTable = async ({
  fetchParams,
  organizationId,
}: FetchParticipants): Promise<FetchParticipantsReturnType> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You must be logged in to see participants info' };

  const validParams = fetchParticipantsSchema.safeParse(fetchParams);
  if (!validParams.success) {
    console.error('Invalid participants params: ', validParams.error);
    return { error: 'Invalid participant params' };
  }

  const {
    role,
    organizationName,
    participantEmail,
    participantName,
    hiddenColumns,
    page,
    pageSize,
  } = validParams.data;

  let existingUser: UserPromise;
  try {
    existingUser = await userPromise(userId);
  } catch (error) {
    console.error('Failed to validate account permissions: ', error);
    return {
      error:
        'Failed to validate account permissions due to a server error. Please try again later',
    };
  }

  if (!existingUser || !existingUser.id || !existingUser.role) {
    return { error: 'We could not match your account information' };
  }

  let userWhereCondition: Prisma.UserWhereInput = {};
  let filterCondition: Prisma.UserWhereInput = {};

  if (role) filterCondition.role = role;

  const searchOrganizationName = organizationName
    ? processSearchString(organizationName)
    : undefined;
  const searchParticipantEmail = participantEmail
    ? processSearchString(participantEmail)
    : undefined;
  const searchParticipantName = participantName
    ? processSearchString(participantName)
    : undefined;

  if (organizationId) {
    filterCondition.organizations = { some: { organizationId } };
  }

  if (searchOrganizationName && !organizationId)
    filterCondition = {
      ...filterCondition,
      organizations: {
        some: { organization: { name: { search: searchOrganizationName } } },
      },
    };

  if (searchParticipantEmail)
    filterCondition = {
      ...filterCondition,
      email: { search: searchParticipantEmail },
    };

  if (searchParticipantName)
    filterCondition = {
      ...filterCondition,
      name: { search: searchParticipantName },
    };

  const hiddenColumnsArray = hiddenColumns ? hiddenColumns.split(',') : [];

  let participants: FetchedParticipantDetails, count: number;
  try {
    [participants, count] = await Promise.all([
      selectParticipantsPromise(
        hiddenColumnsArray,
        { ...userWhereCondition, ...filterCondition },
        page,
        pageSize,
      ),
      db.user.count({ where: userWhereCondition }),
    ]);
    return { participants, count, fetchParams: validParams.data };
  } catch (error) {
    console.error(
      'Failed to fetch participants data due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to fetch participants data due to a server error. Please try again later',
    };
  }
};

export const filterParticipants = async (values: PathParticipantsType) => {
  await filterRedirect(values, pathParticipantsSchema, values.path);
};
