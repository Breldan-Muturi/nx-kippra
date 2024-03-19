"use server";
import bcrypt from "bcryptjs";
import {
  NewPasswordForm,
  newPasswordSchema,
} from "../../validation/account.validation";
import { getPasswordResetTokenByToken } from "../../helpers/reset-token.helper";
import { getUserByEmail } from "../../helpers/user.helper";
import { db } from "../../lib/db";

export const newPassword = async (
  values: NewPasswordForm,
  token?: string | null,
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validateFields = newPasswordSchema.safeParse(values);

  if (!validateFields.success) return { error: "Invalid fields!" };

  const { password } = validateFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) return { error: "Token is expired!" };

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) return { error: "Email does not exist" };

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated successfully" };
};
