import { z } from 'zod';
import { email, validString } from '../reusable.validation';
import { PASSWORD_VALIDATION } from '@/constants/profile.constants';

export const accountSchema = z.object({
  isTwoFactorEnabled: z.boolean(),
  email: email,
  password: validString(PASSWORD_VALIDATION, 6).optional(),
  newPassword: validString(PASSWORD_VALIDATION, 6).optional(),
});
export type AccountForm = z.infer<typeof accountSchema>;
