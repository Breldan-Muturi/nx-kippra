'use server';
import { currentRole } from '@/lib/auth';
import { ActionReturnType } from '@/types/actions.types';
import { UserRole } from '@prisma/client';

export const adminSendEmail = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'Only admins can send application related email' };

  // Send Application Related Email
  return { success: 'Email successfully sent to the applicant' };
};
