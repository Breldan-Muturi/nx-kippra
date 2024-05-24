import { PASSWORD_VALIDATION } from '@/constants/profile.constants';
import { Citizenship, Identification } from '@prisma/client';
import { z } from 'zod';
import {
  characterCount,
  email,
  validImageUpload,
  validString,
} from '../reusable.validation';

export const profileSchema = z.object({
  id: z.string(),
  image: validImageUpload(true),
  firstName: characterCount(3, 20),
  lastName: characterCount(3, 20),
  phoneNumber: characterCount(12, 12, 'Enter a valid phone number'),
  citizenship: z.nativeEnum(Citizenship),
  identification: z.nativeEnum(Identification),
  nationalId: characterCount(7, 12),
  userOrganization: characterCount(5, 80).optional(),
  occupation: characterCount(5, 40).optional(),
  county: characterCount(5, 40),
  address: characterCount(10, 80),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const accountSchema = z.object({
  isTwoFactorEnabled: z.boolean(),
  email: email,
  password: validString(PASSWORD_VALIDATION, 6).optional(),
  newPassword: validString(PASSWORD_VALIDATION, 6).optional(),
});

export type AccountForm = z.infer<typeof accountSchema>;

export const profileUpdateSchema = profileSchema.merge(accountSchema).refine(
  ({ password, newPassword }) => {
    if (password && !newPassword) {
      return false;
    } else if (!password && newPassword) {
      return false;
    } else return true;
  },
  ({ password, newPassword }) => {
    let message: string | undefined, path: (string | number)[] | undefined;
    if (password && !newPassword) {
      message = 'Missing new password';
      path = ['newPassword'];
    } else if (!password && newPassword) {
      message = 'Enter current password';
      path = ['password'];
    }
    return { message, path };
  },
);
export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
export type ProfileSubmitForm = Omit<ProfileUpdateForm, 'image'>;
