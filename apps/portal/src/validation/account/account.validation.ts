import { z } from 'zod';
import {
  characterCount,
  email,
  matchingPasswords,
  requiredCheck,
  requiredField,
} from '../reusable.validation';

export const loginSchema = z.object({
  email,
  password: requiredField,
  code: z.number().optional(),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerFormSchema = z.object({
  firstName: characterCount(3, 12),
  lastName: characterCount(3, 12),
  email,
  password: characterCount(6, 16),
  confirmPassword: requiredField,
  termsConditons: requiredCheck(
    'You may not proceed before accepting the terms and conditions',
  ),
  orgInviteToken: z.string().optional(),
});

export const registerSchema = matchingPasswords(
  registerFormSchema,
  'password',
  'confirmPassword',
);
export type RegisterForm = z.infer<typeof registerSchema>;

export const emailValidation = z.object({ email });
export type EmailValidationType = z.infer<typeof emailValidation>;

export const newPasswordSchema = matchingPasswords(
  z.object({
    password: characterCount(6, 16),
    confirmPassword: requiredField,
  }),
  'password',
  'confirmPassword',
);
export type NewPasswordForm = z.infer<typeof newPasswordSchema>;
