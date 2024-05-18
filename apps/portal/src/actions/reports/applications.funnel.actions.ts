'use server';

import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApplicationStatus, CompletionStatus, UserRole } from '@prisma/client';
import { FunnelRequest } from './reports.actions.types';

export const adminApplicationsFunnel = async (): Promise<FunnelRequest> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only admins allowed to view this report' };
  try {
    const [
      totalApplications,
      approvedApplications,
      totalInvoices,
      totalPayments,
      settledPayments,
      totalCompletedPrograms,
      approvedCompletedPrograms,
    ] = await Promise.all([
      db.application.count(),
      db.application.count({ where: { status: ApplicationStatus.APPROVED } }),
      db.invoice.count(),
      db.payment.count(),
      db.payment.count({ where: { status: 'settled' } }),
      db.completedProgram.count(),
      db.completedProgram.count({
        where: { status: CompletionStatus.APPROVED },
      }),
    ]);
    return [
      {
        id: 'totalApplications',
        value: totalApplications,
        label: 'Total Applications',
      },
      {
        id: 'approvedApplications',
        value: approvedApplications,
        label: 'Approved Applications',
      },
      { id: 'totalInvoices', value: totalInvoices, label: 'Total Invoices' },
      { id: 'totalPayments', value: totalPayments, label: 'Total Payments' },
      {
        id: 'settledPayments',
        value: settledPayments,
        label: 'Settled Payments',
      },
      {
        id: 'totalCompletedPrograms',
        value: totalCompletedPrograms,
        label: 'Total Completed Programs',
      },
      {
        id: 'approvedCompletedPrograms',
        value: approvedCompletedPrograms,
        label: 'Approved Completed Programs',
      },
    ];
  } catch (e) {
    console.error('Failed to get funnel report due to a server error: ', e);
    return {
      error:
        'Failed to get funnel report due to a server error. Please try again later',
    };
  }
};
