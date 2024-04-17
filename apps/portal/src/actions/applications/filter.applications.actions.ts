'use server';

import { formatSponsorType, formatStatus } from '@/helpers/enum.helpers';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { SelectOptions } from '@/types/form-field.types';
import {
  DefaultApplicationParams,
  FilterAdminApplicationType,
  FilterUserApplicationType,
  filterAdminApplicationSchema,
  filterUserApplicationSchema,
} from '@/validation/applications/user.application.validation';
import { Prisma, UserRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import filterRedirect from '../redirect.actions';
import { processSearchString } from '@/helpers/filter.helpers';

export const filterUserApplications = async (
  values: FilterUserApplicationType,
) => {
  await filterRedirect(values, filterUserApplicationSchema, values.path);
};

export const filterAdminApplications = async (
  values: FilterAdminApplicationType,
) => {
  await filterRedirect(values, filterAdminApplicationSchema, values.path);
};

async function cleanUpSelectObject(selectObject: any) {
  Object.keys(selectObject).forEach((key) => {
    if (selectObject[key] === false) {
      delete selectObject[key];
    } else if (
      typeof selectObject[key] === 'object' &&
      selectObject[key] !== null
    ) {
      cleanUpSelectObject(selectObject[key]);
    }
  });
}

export const filterApplicationsTable = async (
  tableParams: DefaultApplicationParams,
) => {
  const {
    page,
    pageSize,
    hiddenColumns,
    organizationName,
    applicantName,
    programTitle,
    status,
    type,
  } = tableParams;
  // Get the user details to determine which applications to show
  const userId = await currentUserId();
  if (!userId) {
    return null;
  }

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!existingUser) {
    return null;
  }
  //Where Condition for the Application
  let where: Prisma.ApplicationWhereInput = {};

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
      organization: { name: { search: searchOrganizationName } },
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
  let select = {
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
    trainingSession:
      !hiddenColumnsArray.includes('program') ||
      !hiddenColumnsArray.includes('training Session')
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
                : false,
              startDate: !hiddenColumnsArray.includes('training Session'),
              endDate: !hiddenColumnsArray.includes('training Session'),
              venue: true,
            },
          }
        : false,
    sponsorType: !hiddenColumnsArray.includes('sponsor Type'),
    slotsCitizen: !hiddenColumnsArray.includes('sponsor Type'),
    slotsEastAfrican: !hiddenColumnsArray.includes('sponsor Type'),
    slotsGlobal: !hiddenColumnsArray.includes('sponsor Type'),
    _count: !hiddenColumnsArray.includes('sponsor Type')
      ? {
          select: {
            participants: true,
          },
        }
      : undefined,
    delivery: !hiddenColumnsArray.includes('delivery'),
    applicationFee: !hiddenColumnsArray.includes('fee'),
    participants: {
      select: {
        email: true,
        name: true,
      },
    },
  };

  await cleanUpSelectObject(select);

  // Returns applications as per filters and views
  const applicationsPromise = db.application.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    select,
  });

  // Returns the count of the applications based on the filters
  const applicationsCount = db.application.count({ where });

  // Returns the options for the status
  const statusPromise = db.application.findMany({
    select: { status: true },
    distinct: ['status'],
  });

  // Returns options for the sponsor type
  const sponsorTypePromise = db.application.findMany({
    select: { sponsorType: true },
    distinct: ['sponsorType'],
  });

  const [applications, count, statuses, sponsorTypes] = await Promise.all([
    applicationsPromise,
    applicationsCount,
    statusPromise,
    sponsorTypePromise,
  ]);

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
    applications: applications,
    count: count,
    tableParams,
    filters: {
      filterStatus: filterStatus,
      filterSponsorType: filterSponsorType,
    },
  };
};

export type FilterApplicationTableType = NonNullable<
  Awaited<ReturnType<typeof filterApplicationsTable>>
>;
export type ApplicationFilterType = FilterApplicationTableType['filters'] & {
  disabled?: boolean;
};
export type SingleTableApplication =
  FilterApplicationTableType['applications'][number];
export type ApplicationColumnType = ColumnDef<SingleTableApplication>[];
export type ApplicationTableUser = FilterApplicationTableType['existingUser'];
