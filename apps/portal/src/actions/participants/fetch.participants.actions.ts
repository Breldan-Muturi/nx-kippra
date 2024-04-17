'use server';

import { processSearchString } from '@/helpers/filter.helpers';
import { db } from '@/lib/db';
import {
  FetchParticipantsRedirectType,
  FetchParticipantsType,
  fetchParticipantsRedirectSchema,
  fetchParticipantsSchema,
} from '@/validation/participants/participants.validation';
import { Prisma } from '@prisma/client';
import filterRedirect from '../redirect.actions';

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

export type FetchParticipantsReturnType =
  | { error: string }
  | { participants: FetchedParticipantDetails; count: number };
export type ParticipantsTableProps = {
  participantsInfo: Exclude<FetchParticipantsReturnType, { error: string }>;
  tableParams: FetchParticipantsType;
};

export const fetchParticipantsTable = async (
  params: FetchParticipantsType,
): Promise<FetchParticipantsReturnType> => {
  const validParams = fetchParticipantsSchema.safeParse(params);
  if (!validParams.success) {
    return { error: 'Invalid participant params' };
  }
  const {
    userId,
    role,
    organizationName,
    participantEmail,
    participantName,
    hiddenColumns,
    page,
    pageSize,
  } = validParams.data;

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

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

  if (searchOrganizationName)
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

  const [participants, count] = await Promise.all([
    selectParticipantsPromise(
      hiddenColumnsArray,
      { ...userWhereCondition, ...filterCondition },
      page,
      pageSize,
    ),
    db.user.count({ where: userWhereCondition }),
  ]);

  return { participants, count };
};

export const filterParticipants = async (
  values: FetchParticipantsRedirectType,
) => {
  await filterRedirect(values, fetchParticipantsRedirectSchema, values.path);
};
