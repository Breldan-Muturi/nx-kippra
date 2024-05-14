'use server';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const applicationPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      currency: true,
      applicationFee: true,
      owner: { select: { name: true, email: true } },
      organization: { select: { name: true } },
      slotsCitizen: true,
      slotsEastAfrican: true,
      slotsGlobal: true,
    },
  });
type ApplicationPromise = Awaited<ReturnType<typeof applicationPromise>>;
export type ApplicationApproval = NonNullable<ApplicationPromise>;

export const fetchApprovalApplication = async (
  id: string,
): Promise<{ error: string } | ApplicationApproval> => {
  const user = await currentUser();
  if (!user) return { error: 'You must be logged in to proceed' };
  if (user.role !== UserRole.ADMIN)
    return { error: 'Only admins can approve applications' };

  let application: ApplicationPromise;
  try {
    application = await applicationPromise(id);
  } catch (e) {
    console.error(
      'Failed to fetch approval application due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch approval application due to a server error. Please try again later',
    };
  }
  if (!application)
    return {
      error:
        'The application selected no longer exists. Please confirm and try again later',
    };
  return application;
};
