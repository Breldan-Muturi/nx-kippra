import { z } from "zod";
import { characterCount, validString, validUrl } from "./reusable.validation";
import { Citizenship, Identification } from "@prisma/client";

export const newProfileSchema = z.object({
  image: validUrl("Use a valid image url"),
  firstName: characterCount(3, 20),
  lastName: characterCount(3, 20),
  phoneNumber: characterCount(12, 12, "Enter a valid phone number"),
  citizenship: z.nativeEnum(Citizenship),
  identification: z.nativeEnum(Identification),
  nationalId: characterCount(7, 12),
  userOrganization: characterCount(5, 80),
  occupation: characterCount(5, 40),
  county: characterCount(5, 40),
  address: characterCount(10, 80),
});
export type NewProfileForm = z.infer<typeof newProfileSchema>;

export const accountSchema = z.object({
  isTwoFactorEnabled: z.optional(z.boolean()),
  email: z.optional(z.string().email()),
  password: z.optional(
    validString("Password must be at least 6 characters", 6),
  ),
  newPassword: z.optional(
    validString("New password must be at least 6 characters", 6),
  ),
});
export type AccountForm = z.infer<typeof accountSchema>;

export const updateProfileSchema = newProfileSchema.partial().extend({
  id: z.string(),
});
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export const userSettingsSchema = updateProfileSchema
  .merge(accountSchema)
  .refine(
    ({ password, newPassword }) => {
      if (password && !newPassword) {
        return false;
      } else if (!password && newPassword) {
        return false;
      }
    },
    ({ password, newPassword }) => {
      let message: string | undefined, path: (string | number)[] | undefined;
      if (password && !newPassword) {
        message = "New password required";
        path = ["newPassword"];
      } else if (!password && newPassword) {
        message = "Current password required";
        path = ["password"];
      }
      return {
        message,
        path,
      };
    },
  );

export type UserSettingsForm = z.infer<typeof userSettingsSchema>;
