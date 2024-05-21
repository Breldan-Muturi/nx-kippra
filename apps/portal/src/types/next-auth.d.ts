import { Citizenship, UserRole } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole;
  citizenship: Citizenship;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  image?: string;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}
