'use server';

import { getUserByEmail } from '@/helpers/user.helper';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/mail/account.mail';
import { ActionReturnType } from '@/types/actions.types';
import {
  EmailValidationType,
  emailValidation,
} from '@/validation/account/account.validation';

export const reset = async (
  values: EmailValidationType,
): Promise<ActionReturnType> => {
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
