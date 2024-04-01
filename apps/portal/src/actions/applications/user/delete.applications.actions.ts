'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { deletedApplicationEmail } from '@/mail/application.mail';
import { ActionReturnType } from '@/types/actions.types';

export const userDeleteApplication = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  const userId = await currentUserId();

  if (!userId) {
    return { error: 'First log in to delete this application' };
  }

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser || !existingUser.id) {
    return {
      error: 'This user does not exist, and cannot delete applications',
    };
  }

  const existingApplication = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      owner: { select: { id: true, email: true } },
      participants: { select: { email: true } },
      trainingSession: {
        select: {
          venue: true,
          startDate: true,
          endDate: true,
          program: { select: { title: true } },
        },
      },
    },
  });

  if (!existingApplication || !existingApplication.id) {
    return { error: 'This application cannot be deleted as it does not exist' };
  }

  if (existingUser.id !== existingApplication.owner.id) {
    return {
      error:
        'Only the owner/applicant of this application is allowed to delete it',
    };
  }

  const applicationEmails = [
    ...existingApplication.participants
      .filter(({ email }) => email !== null)
      .map(({ email }) => email),
    existingApplication.owner.email ?? '',
  ];

  try {
    // To Do: Handle withdrawal of slots for the training session
    // when an application is deleted
    await deletedApplicationEmail({
      applicationEmails,
      endDate: existingApplication.trainingSession.endDate,
      startDate: existingApplication.trainingSession.startDate,
      title: existingApplication.trainingSession.program.title,
      venue: existingApplication.trainingSession.venue ?? undefined,
    });
    await db.application.delete({ where: { id: applicationId } });
    return { success: 'Application deleted successfully' };
  } catch (error) {
    console.log('Error deleting application: ', error);
    return {
      error:
        'Something went wrong deleting this application. Please try again later',
    };
  }
};
