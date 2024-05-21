import { db } from '../lib/db';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: { image: { select: { fileUrl: true } } },
    });
    return user;
  } catch {
    return null;
  }
};
export type UserById = NonNullable<Awaited<ReturnType<typeof getUserById>>>;

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await db.account.findFirst({
      where: { userId },
    });
    return account;
  } catch {
    return null;
  }
};

export const splitUserName = (
  fullName: string | null,
): { firstName: string | null; lastName: string | null } => {
  if (fullName === null) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }
  // Assuming the last part is the last name and all other parts constitute the first name
  const lastName = parts.pop()!;
  const firstName = parts.join(' ');

  return { firstName, lastName };
};

export const avatarFallbackName = (name?: string | null): string => {
  if (!name) {
    return 'NA';
  }
  const nameParts = name.trim().split(' ');
  if (nameParts.length > 1) {
    return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
  } else if (nameParts.length === 1 && nameParts[0].length > 1) {
    // Return the first two characters if there is only one part and it's longer than one character
    return nameParts[0].charAt(0) + nameParts[0].charAt(1);
  } else if (nameParts.length === 1) {
    // Return the first character if there's only one and it's a single character
    return nameParts[0].charAt(0);
  }
  return nameParts[0].charAt(0).toUpperCase();
};
