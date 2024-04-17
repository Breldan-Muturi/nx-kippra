import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const currentUserId = async () => {
  const session = await auth();
  return session?.user.id;
};

export const currentRole = async () => {
  const session = await auth();
  return session?.user.role;
};

export const currentUserOAuth = async () => {
  const session = await auth();
  return session?.user.isOAuth;
};

type AdminFunction = (...args: any[]) => Promise<any>;
export const withAdminCheck =
  (fn: AdminFunction) =>
  async (...args: any[]) => {
    const role = await currentRole();
    if (!role || role !== UserRole.ADMIN) {
      return { error: 'You are not permitted to perform this action' };
    }

    return fn(...args);
  };
