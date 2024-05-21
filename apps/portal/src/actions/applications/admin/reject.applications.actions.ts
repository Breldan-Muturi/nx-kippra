'use server';
import { currentRole } from '@/lib/auth';
import { ActionReturnType } from '@/types/actions.types';
import { UserRole } from '@prisma/client';

export const adminRejectApplication = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'You are not permited to reject applications' };

  // Update Application Status
  // Send Applcation Rejection Email
  return { success: 'Application approved successfully' };
};
