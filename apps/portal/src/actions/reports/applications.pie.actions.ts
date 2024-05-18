'use server';

import { PieData } from '@/components/charts/pie';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { PieRequest } from './reports.actions.types';

export const adminParticipantsPie = async (): Promise<PieRequest> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only admins can view this report' };
  try {
    const applications = await db.application.findMany({
      select: {
        trainingSession: {
          select: {
            program: { select: { id: true, code: true, title: true } },
          },
        },
        slotsCitizen: true,
        slotsEastAfrican: true,
        slotsGlobal: true,
      },
    });
    const aggregatedData = applications.reduce<Record<string, number>>(
      (acc, app) => {
        const progamCode = app.trainingSession.program.code;
        const participantSum =
          app.slotsCitizen + app.slotsEastAfrican + app.slotsGlobal;
        if (acc[progamCode]) {
          acc[progamCode] += participantSum;
        } else {
          acc[progamCode] = participantSum;
        }
        return acc;
      },
      {},
    );
    const pieData: PieData[] = Object.entries(aggregatedData).map(
      ([label, value]) => ({
        id: label,
        label,
        value,
      }),
    );
    return pieData;
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

export const admincitizenshipPie = async (): Promise<PieRequest> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only admins can view this report' };
  try {
    const applications = await db.application.findMany({
      select: {
        slotsCitizen: true,
        slotsEastAfrican: true,
        slotsGlobal: true,
      },
    });
    const citizenshipCounts = applications.reduce(
      (acc, app) => {
        acc.slotsCitizen += app.slotsCitizen;
        acc.slotsEastAfrican += app.slotsEastAfrican;
        acc.slotsGlobal += app.slotsGlobal;
        return acc;
      },
      { slotsCitizen: 0, slotsEastAfrican: 0, slotsGlobal: 0 },
    );
    const pieData: PieData[] = [
      {
        id: 'Citizen',
        label: 'Citizen',
        value: citizenshipCounts.slotsCitizen,
      },
      {
        id: 'East African',
        label: 'East African',
        value: citizenshipCounts.slotsEastAfrican,
      },
      { id: 'Global', label: 'Global', value: citizenshipCounts.slotsGlobal },
    ];
    return pieData;
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
