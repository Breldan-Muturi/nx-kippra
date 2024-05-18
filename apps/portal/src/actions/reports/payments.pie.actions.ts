'use server';

import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { PieRequest } from './reports.actions.types';

export const adminPaymentsPie = async (): Promise<PieRequest> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only admins allowed to view this report' };
  try {
    const currencyData = await db.payment.groupBy({
      by: ['currency'],
      _count: {
        currency: true,
      },
      where: {
        currency: {
          in: ['KES', 'USD'],
        },
      },
    });
    return currencyData.map((data) => ({
      id: data.currency,
      value: data._count.currency,
      label: `${data.currency} payments`,
    }));
  } catch (e) {
    console.error(
      'Failed to fetch payment currencies due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch payment currencies due to a server error. Please try again later',
    };
  }
};
