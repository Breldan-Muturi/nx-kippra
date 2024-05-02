'use server';

import bcrypt from 'bcryptjs';
import {
  RegisterForm,
  registerSchema,
} from '@/validation/account/account.validation';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/helpers/user.helper';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/mail/account.mail';
import { OrganizationRole, User } from '@prisma/client';

const invitePromise = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) =>
  await db.inviteOrganization.findFirst({
    where: { AND: [{ email }, { token }] },
    select: { id: true, expires: true, organizationId: true },
  });
type InvitePromise = Awaited<ReturnType<typeof invitePromise>>;

export const register = async (values: RegisterForm) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, firstName, lastName, password, orgInviteToken } =
    validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email already in use' };
  }

  let user: User, invite: InvitePromise | undefined;
  try {
    [user, invite] = await Promise.all([
      db.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
        },
      }),
      orgInviteToken
        ? invitePromise({ email, token: orgInviteToken })
        : Promise.resolve(undefined),
    ]);
  } catch (error) {
    console.error('Failed to create account due to a server error: ', error);
    return {
      error:
        'Failed to create account due to a server error. Please try again later',
    };
  }

  if (invite) {
    if (invite.expires < new Date())
      return {
        error: 'This invite is expired, please refresh the page, and try again',
      };
    try {
      await db.$transaction(
        async (prisma) => {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
              organizations: {
                create: {
                  role: OrganizationRole.MEMBER,
                  organizationId: invite?.organizationId as string,
                },
              },
            },
          });
          await prisma.inviteOrganization.delete({
            where: { id: invite?.id as string },
          });
        },
        { maxWait: 20000, timeout: 20000 },
      );
      // To Do: Add an email notification to the person that invited this user.
      return {
        success: `Account created successfully and added to the organization`,
      };
    } catch (error) {
      console.error(
        'Failed to complete invite workflow due to a server error: ',
        error,
      );
      return {
        error:
          'Failed to complete invite workflow due to a server error. Please try again later',
      };
    }
  } else {
    try {
      const verificationToken = await generateVerificationToken(user.email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
      return { success: 'Account created successfully' };
    } catch (error) {
      console.error(
        'Failed to send a verification token due to a server error: ',
        error,
      );
      return {
        error:
          'Failed to send a verification token due to a server error. Please try again later',
      };
    }
  }
};
