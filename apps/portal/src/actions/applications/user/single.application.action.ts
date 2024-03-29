import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const applicationParticipantPromise = async (id: string) => {
  return await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      delivery: true,
      sponsorType: true,
      trainingSession: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          venue: true,
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
      participants: {
        select: {
          name: true,
          user: { select: { image: true } },
        },
      },
      owner: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
};
export type ApplicationParticipantReturn = NonNullable<
  Awaited<ReturnType<typeof applicationParticipantPromise>>
>;

const applicationAdminPromise = async (id: string) => {
  return await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      delivery: true,
      sponsorType: true,
      applicationFee: true,
      offerLetter: true,
      status: true,
      proformaInvoice: true,
      slotsCitizen: true,
      slotsEastAfrican: true,
      slotsGlobal: true,
      trainingSession: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          venue: true,
          program: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          contactPersonName: true,
          contactPersonEmail: true,
        },
      },
      participants: {
        select: {
          name: true,
          user: { select: { image: true, id: true } },
          nationalId: true,
          attendanceConfirmed: true,
          email: true,
          organizationName: true,
          citizenship: true,
        },
      },
      owner: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
};
export type ApplicationAdminReturn = NonNullable<
  Awaited<ReturnType<typeof applicationAdminPromise>>
>;

export type ViewApplicationReturnType =
  | { error: string }
  | {
      isApplicationAdmin: false;
      applicationParticipant: ApplicationParticipantReturn;
    }
  | { isApplicationAdmin: true; applicationAdmin: ApplicationAdminReturn };

export const getApplicationByIdPromise = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<ViewApplicationReturnType> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      ownedApplications: { select: { id: true } },
    },
  });
  if (!user || !user.id) {
    return { error: 'Only registered users can view applications' };
  }

  const isApplicationAdmin =
    user.ownedApplications.map(({ id }) => id).includes(id) ||
    user.role === UserRole.ADMIN;

  if (isApplicationAdmin) {
    const applicationAdmin = await applicationAdminPromise(id);
    if (!applicationAdmin || !applicationAdmin.id) {
      return {
        error:
          'Error retrieving application information, please try again later',
      };
    } else {
      return { isApplicationAdmin, applicationAdmin };
    }
  }

  const applicationParticipant = await db.applicationParticipant.findFirst({
    where: {
      applicationId: id,
      OR: [{ userId: user.id }, { email: user.email }, { name: user.name }],
    },
    select: { id: true },
  });

  if (!!applicationParticipant) {
    const applicationParticipant = await applicationParticipantPromise(id);
    if (!applicationParticipant || !applicationParticipant.id) {
      return {
        error:
          'Error retrieving application information. Please try again later',
      };
    } else {
      return { isApplicationAdmin, applicationParticipant };
    }
  }
  console.log(
    'Server action error: Only admins or application participants and owners can view details',
  );
  return {
    error:
      'Only admins or application participants and owners can view details',
  };
};
