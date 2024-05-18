'use server';

import { UserRole } from '.prisma/client';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { LineRequest } from './reports.actions.types';

type AggregatedData = {
  [programId: string]: {
    [date: string]: number;
  };
};

export const adminApplicationsLine = async (): Promise<LineRequest> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only admins are allowed to view this report' };
  try {
    const applications = await db.application.findMany({
      where: {
        submittedAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // from the start of this year
          lte: new Date(new Date().getFullYear(), 11, 31), // to the end of this year
        },
      },
      select: {
        submittedAt: true,
        trainingSession: { select: { program: { select: { code: true } } } },
        slotsCitizen: true,
        slotsEastAfrican: true,
        slotsGlobal: true,
      },
    });

    const allMonths = new Set<string>();

    const aggregatedData = applications.reduce<AggregatedData>((acc, app) => {
      const month = app.submittedAt.toISOString().slice(0, 7); // Javascript months are 0-indexed
      const programCode = app.trainingSession.program.code;
      const totalSlots =
        app.slotsCitizen + app.slotsEastAfrican + app.slotsGlobal;

      allMonths.add(month);

      if (!acc[programCode]) {
        acc[programCode] = {};
      }
      if (!acc[programCode][month]) {
        acc[programCode][month] = 0;
      }
      acc[programCode][month] += totalSlots;
      return acc;
    }, {});

    const uniqueMonths = Array.from(allMonths).sort();

    const series = Object.entries(aggregatedData).map(
      ([programCode, monthlyCounts]) => ({
        id: programCode,
        // data: Object.entries(monthlyCounts).map(([month, count]) => ({
        //   x: month,
        //   y: count,
        // })),
        data: uniqueMonths.map((month) => ({
          x: month,
          y: monthlyCounts[month] || 0,
        })),
      }),
    );
    console.log('Series: ', JSON.stringify(series, null, 2));
    return series;
  } catch (e) {
    console.error(
      'Failed to fetch applications data due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch applications data due to a server error. Please try again later',
    };
  }
};
