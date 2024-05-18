'use server';

import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { BarDatum } from '@nivo/bar';
import { UserRole } from '@prisma/client';
type AggregatedData = {
  [month: string]: {
    [programCode: string]: number;
  };
};
export type BarReturn =
  | { data: BarDatum[]; keys: string[] }
  | { error: string };
export const adminPaymentsBar = async (): Promise<BarReturn> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only admins are able to view this report' };
  try {
    const payments = await db.payment.findMany({
      where: { status: 'settled' },
      select: {
        payment_date: true,
        amount_paid: true,
        application: {
          select: {
            trainingSession: {
              select: {
                program: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const aggregatedData = payments.reduce<AggregatedData>((acc, payment) => {
      const month = new Date(payment.payment_date).toLocaleString('default', {
        month: 'short',
      });
      const programCode = payment.application.trainingSession.program.code;
      const amount_paid = payment.amount_paid;
      if (!acc[month]) {
        acc[month] = {};
      }
      if (!acc[month][programCode]) {
        acc[month][programCode] = 0;
      }
      acc[month][programCode] += amount_paid;
      return acc;
    }, {});
    const months = Object.keys(aggregatedData);
    const programCodes = new Set<string>();
    const data = months.map((month) => {
      const monthData: { month: string; [key: string]: number | string } = {
        month,
      };
      Object.keys(aggregatedData[month]).forEach((programCode) => {
        monthData[programCode] = aggregatedData[month][programCode];
        programCodes.add(programCode);
      });
      return monthData;
    });
    const keys = Array.from(programCodes);
    return { data, keys };
  } catch (e) {
    console.error('Failed to fetch payments data due to a server error: ', e);
    return {
      error:
        'Failed to fetch payments data due to a server error. Please try again later',
    };
  }
};
