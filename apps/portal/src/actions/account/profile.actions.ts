"use server";

import { unstable_update } from "@/auth";
import { getUserByEmail, getUserById } from "@/helpers/user.helper";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/mail/account.mail";
import { UserSettingsForm } from "@/validation/profile.validation";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

export const updateProfile = async (
  data: UserSettingsForm,
): Promise<{ error?: string; success?: string; user?: User }> => {
  const { id, firstName, lastName, newPassword, ...userData } = data;

  const username = `${firstName} ${lastName}`;

  const dbUser = await getUserById(id);

  if (!dbUser) return { error: "Unauthorized" };

  // Update the users email
  if (userData.email && userData.email !== dbUser.email) {
    const userWithExistingEmail = await getUserByEmail(userData.email);
    if (userWithExistingEmail) {
      return { error: "This email is already in use." };
    }
    const verificationToken = await generateVerificationToken(userData.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );
    return { success: "A verification token has been sent to your new email" };
  }

  // Update the user's password
  if (userData.password && newPassword && dbUser.password) {
    const currentPasswordMatches = await bcrypt.compare(
      userData.password,
      dbUser.password,
    );

    if (!currentPasswordMatches) {
      return { error: "Incorrect password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: username,
      ...userData,
    },
  });

  unstable_update({
    user: {
      email: updatedUser.email,
      name: updatedUser.name,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      image: updatedUser.image,
    },
  });

  // Update this so the new user data updates the form fields
  return { success: "Profile updated successfully 🎉", user: updatedUser };
};
