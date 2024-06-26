'use server';

import { getUserByEmail, getUserById } from '@/helpers/user.helper';
import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/mail/account.mail';
import {
  ProfileSubmitForm,
  ProfileUpdateForm,
} from '@/validation/profile/profile.validation';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  FilesUpload,
  deleteFiles,
  filesUpload,
} from '../firebase/storage.actions';

export type ProfileActionParams =
  | {
      formData: FormData;
      data: ProfileSubmitForm;
    }
  | {
      data: ProfileUpdateForm;
    };

export const updateProfile = async (
  profileActionParams: ProfileActionParams,
): Promise<{
  error?: string;
  success?: string;
  user?: User;
}> => {
  let formData: FormData | undefined;
  let data: ProfileUpdateForm;

  if ('formData' in profileActionParams) {
    formData = profileActionParams.formData;
    data = profileActionParams.data;
  } else {
    data = profileActionParams.data;
  }

  const { id, firstName, lastName, newPassword, ...userData } = data;
  const username = `${firstName} ${lastName}`;
  const dbUser = await getUserById(id);
  if (!dbUser) return { error: 'Unauthorized' };

  // Update the users email
  if (userData.email && userData.email !== dbUser.email) {
    const userWithExistingEmail = await getUserByEmail(userData.email);
    if (userWithExistingEmail) {
      return { error: 'This email is already in use.' };
    }
    const verificationToken = await generateVerificationToken(userData.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );
    return { success: 'A verification token has been sent to your new email' };
  }

  // Update the user's password
  if (userData.password && newPassword && dbUser.password) {
    const currentPasswordMatches = await bcrypt.compare(
      userData.password,
      dbUser.password,
    );

    if (!currentPasswordMatches) {
      return { error: 'Incorrect password' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
  }

  let imageUser: FilesUpload | undefined;
  if (formData) {
    const image = formData.get('image') as File;
    const [_, upload] = await Promise.all([
      !!dbUser.image?.fileUrl
        ? deleteFiles([dbUser.image.fileUrl])
        : Promise.resolve(undefined),
      filesUpload([image], `participant/${dbUser.id}`),
    ]);
    if ('error' in upload) {
      return { error: upload.error };
    }
    imageUser = upload[0];
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...userData,
      name: username,
      image: !!imageUser
        ? {
            upsert: {
              where: { userId: dbUser.id },
              create: imageUser,
              update: imageUser,
            },
          }
        : undefined,
    },
    include: {
      image: { select: { fileUrl: true } },
    },
  });

  // unstable_update({
  //   user: {
  //     email: updatedUser.email,
  //     name: updatedUser.name,
  //     isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
  //     image: updatedUser.image?.fileUrl,
  //   },
  // });

  // Update this so the new user data updates the form fields
  return { success: 'Profile updated successfully 🎉', user: updatedUser };
};
