'use server';

import {
  LoginForm,
  loginSchema,
} from '@/validation/account/account.validation';
import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/helpers/user.helper';
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from '@/lib/tokens';
import {
  sendTwoFactorTokenEmail,
  sendVerificationEmail,
} from '@/mail/account.mail';
import { getTwoFactorTokenByEmail } from '../../helpers/two-factor.token';
import { db } from '../../lib/db';
import { getTwoFactorConfirmationByUserId } from '../../helpers/two-factor-confirmation.helper';

export const login = async (values: LoginForm, callbackUrl?: string | null) => {
  const validatedFields = loginSchema.safeParse(values);
  if (!validatedFields.success) return { error: 'Invalid fields' };
  const { email, password, code } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'User with this email does not exist' };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );
    return { success: 'Confirmation email for your account has been sent' };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code.toString()) {
        return { error: 'Invalid code!' };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: 'Code is expired!' };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
    return { success: 'Login successful! Welcome back 🎉' };
  } catch (error) {
    // To Do
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' };
        default:
          return { error: 'Something went wrong. Please try again later' };
      }
    }
    throw error;
  }
};
