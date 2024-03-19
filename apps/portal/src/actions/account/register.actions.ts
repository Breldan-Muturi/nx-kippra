"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { RegisterForm, registerSchema } from "@/validation/account.validation";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/helpers/user.helper";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/mail/account.mail";

export const register = async (values: RegisterForm) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, firstName, lastName, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use" };
  }

  await db.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
    },
  });

  // To Do: Send Verification Token email
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Account created successfully" };
};
