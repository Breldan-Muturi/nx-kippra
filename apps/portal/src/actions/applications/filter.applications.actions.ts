'use server';

import { formatSponsorType, formatStatus } from '@/helpers/enum.helpers';
import { processSearchString } from '@/helpers/filter.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { SelectOptions } from '@/types/form-field.types';
import {
  FetchApplicationType,
  PathApplicationType,
  pathApplicationSchema,
} from '@/validation/applications/table.application.validation';
import { Prisma, UserRole } from '@prisma/client';
import filterRedirect from '../redirect.actions';

export const filterApplications = async (values: PathApplicationType) => {
  await filterRedirect(values, pathApplicationSchema, values.path);
};

const userPromise = async (id: string) =>
  await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
type UserPromiseReturn = Awaited<ReturnType<typeof userPromise>>;
export type AppTableUser = NonNullable<UserPromiseReturn>;

const applicationsPromise = async ({
  where,
  page,
  pageSize,
  hiddenColumnsArray,
}: {
  where: Prisma.ApplicationWhereInput;
  page: string;
  pageSize: string;
  hiddenColumnsArray: string[];
}) => {
  const showSponsor = hiddenColumnsArray.includes('sponsor Type')
    ? undefined
    : true;
  const showTrainingSession = hiddenColumnsArray.includes('training Session')
    ? undefined
    : true;
  const showTrainingSessionModel =
    !hiddenColumnsArray.includes('program') ||
    !hiddenColumnsArray.includes('training Session');

  return await db.application.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select: {
      id: true,
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      status: true,
      trainingSession: showTrainingSessionModel
        ? {
            select: {
              program: !hiddenColumnsArray.includes('program')
                ? {
                    select: {
                      id: true,
                      title: true,
                      code: true,
                    },
                  }
                : undefined,
              startDate: showTrainingSession,
              endDate: showTrainingSession,
              venue: true,
            },
          }
        : undefined,
      sponsorType: showSponsor,
      slotsCitizen: showSponsor,
      slotsEastAfrican: showSponsor,
      slotsGlobal: showSponsor,
      _count: showSponsor
        ? {
            select: {
              participants: true,
            },
          }
        : undefined,
      delivery: hiddenColumnsArray.includes('delivery') ? undefined : true,
      applicationFee: hiddenColumnsArray.includes('fee') ? undefined : true,
      currency: hiddenColumnsArray.includes('currency') ? undefined : true,
      participants: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
};
type ApplicationsTable = Awaited<ReturnType<typeof applicationsPromise>>;
export type SingleTableApplication = ApplicationsTable[number];

const applicationsCountPromise = async (
  where: Prisma.ApplicationWhereInput,
): Promise<number> => await db.application.count({ where });

const applicationsStatusPromise = async () =>
  await db.application.findMany({
    select: { status: true },
    distinct: ['status'],
  });
type ApplicationsStatusPromise = Awaited<
  ReturnType<typeof applicationsStatusPromise>
>;

const applicationsSponsorPromise = async () =>
  await db.application.findMany({
    select: { sponsorType: true },
    distinct: ['sponsorType'],
  });
type ApplicationsSponsorPromise = Awaited<
  ReturnType<typeof applicationsSponsorPromise>
>;
export type FilterApplicationTableType = {
  existingUser: AppTableUser;
  applications: SingleTableApplication[];
  count: number;
  fetchParams: FetchApplicationType;
  filterStatus: SelectOptions[];
  filterSponsorType: SelectOptions[];
};
export type FilterApplicationReturnType =
  | { error: string }
  | FilterApplicationTableType;

export const filterApplicationsTable = async (
  fetchParams: FetchApplicationType,
  organizationId?: string,
): Promise<FilterApplicationReturnType> => {
  const {
    page,
    pageSize,
    hiddenColumns,
    organizationName,
    applicantName,
    programTitle,
    status,
    type,
  } = fetchParams;
  // Get the user details to determine which applications to show
  const userId = await currentUserId();
  if (!userId) {
    return { error: 'You must be logged in to view applications' };
  }

  let existingUser: UserPromiseReturn;
  try {
    existingUser = await userPromise(userId);
  } catch (error) {
    console.error('Failed to authorize request: ', error);
    return {
      error:
        'Failed to authorize request due to a server error. Please try again later.',
    };
  }

  if (!existingUser || !existingUser.id) {
    return {
      error: 'Failed to authenticate your account. Please try again later',
    };
  }
  //Where Condition for the Application
  let where: Prisma.ApplicationWhereInput = {};

  if (organizationId) where.organizationId = organizationId;

  if (status) where.status = status;
  if (type) where.sponsorType = type;

  const searchProgramTitle = programTitle
    ? processSearchString(programTitle)
    : undefined;
  const searchOrganizationName = organizationName
    ? processSearchString(organizationName)
    : undefined;
  const searchApplicantName = applicantName
    ? processSearchString(applicantName)
    : undefined;

  if (searchProgramTitle)
    where = {
      ...where,
      trainingSession: { program: { title: { search: searchProgramTitle } } },
    };

  if (searchOrganizationName)
    where = {
      ...where,
      organization: organizationId
        ? undefined
        : { name: { search: searchOrganizationName } },
    };

  if (searchApplicantName)
    where = { ...where, owner: { name: { search: searchApplicantName } } };

  if (existingUser.role !== UserRole.ADMIN) {
    where = {
      ...where,
      OR: [
        { ownerId: existingUser.id },
        { participants: { some: { userId: existingUser.id } } },
        { participants: { some: { email: existingUser.email } } },
        { participants: { some: { name: existingUser.name } } },
      ],
    };
  }

  // Select Object for the Query
  const hiddenColumnsArray = hiddenColumns ? hiddenColumns?.split(',') : [];

  let applications: ApplicationsTable,
    count: number,
    statuses: ApplicationsStatusPromise,
    sponsorTypes: ApplicationsSponsorPromise;
  try {
    [applications, count, statuses, sponsorTypes] = await Promise.all([
      applicationsPromise({ where, page, pageSize, hiddenColumnsArray }),
      applicationsCountPromise(where),
      applicationsStatusPromise(),
      applicationsSponsorPromise(),
    ]);
  } catch (error) {
    console.error(
      'Failed to fetch applications due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to fetch applications due to a server error. Please try again later',
    };
  }

  const filterStatus: SelectOptions[] = statuses.map(({ status }) => ({
    value: status,
    optionLabel: formatStatus(status),
  }));
  const filterSponsorType: SelectOptions[] = sponsorTypes.map(
    ({ sponsorType }) => ({
      value: sponsorType,
      optionLabel: formatSponsorType(sponsorType),
    }),
  );

  return {
    existingUser,
    applications,
    count,
    fetchParams,
    filterStatus,
    filterSponsorType,
  };
};
