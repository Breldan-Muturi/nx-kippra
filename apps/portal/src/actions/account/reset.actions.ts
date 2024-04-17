'use server';

import { getUserByEmail } from '@/helpers/user.helper';
import { generatePasswordResetToken } from '@/lib/tokens';
import {
  EmailValidationType,
  emailValidation,
} from '@/validation/account/account.validation';
import { sendPasswordResetEmail } from '@/mail/account.mail';

export const reset = async (values: EmailValidationType) => {
  const validateFields = emailValidation.safeParse(values);
  if (!validateFields.success) return { error: 'Invalid email' };
  const { email } = validateFields.data;
  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { error: 'Email not found' };
  }
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );
  return { success: 'Check your email to reset your password' };
};
