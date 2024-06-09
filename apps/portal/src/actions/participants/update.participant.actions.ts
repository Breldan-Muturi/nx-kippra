'use server';

import { formatRoles } from '@/helpers/enum.helpers';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnType } from '@/types/actions.types';
import { UserRole } from '@prisma/client';

const updateRole = async ({
  id,
  updateToAdmin,
}: {
  id: string;
  updateToAdmin: boolean;
}): Promise<ActionReturnType> => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  if (!isAdmin) return { error: 'Only Admins can update user roles' };

  try {
    await db.user.update({
      where: { id },
      data: { role: updateToAdmin ? UserRole.ADMIN : UserRole.USER },
    });
    return {
      success: `User updated to ${formatRoles(updateToAdmin ? UserRole.ADMIN : UserRole.USER)} successfully`,
    };
  } catch (e) {
    console.error('Error updating user role: ', e);
    return {
      error:
        'Failed to update user role due to a server error. Please try again later',
    };
  }
};

export default updateRole;
