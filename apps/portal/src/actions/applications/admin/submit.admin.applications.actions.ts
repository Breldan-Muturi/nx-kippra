'use server';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const submitAdminApplication = async () => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You must be logged in to submit this application' };
  const [existingUser] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    }),
  ]);
  if (!existingUser || !existingUser.id)
    return { error: 'User account not found, please try again later' };
  if (!existingUser.role || existingUser.role !== UserRole.ADMIN)
    return { error: 'You are not authorized to submit this application' };
};
