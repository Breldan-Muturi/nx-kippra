'use server';

import { formatVenues } from '@/helpers/enum.helpers';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  removeMeOwnerEmail,
  removeMeParticipantEmail,
} from '@/mail/application.mail';
import { ActionReturnType } from '@/types/actions.types';
import { Citizenship, Delivery } from '@prisma/client';
import { format } from 'date-fns';

export const userRemoveApplication = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  const user = await currentUser();

  if (!user || !user.email || !user.name) {
    return { error: 'You need to be logged in to proceed with this action' };
  }

  // Attempt to find the participant based on the existing user details
  const participant = await db.applicationParticipant.findFirst({
    where: {
      applicationId,
      OR: [{ userId: user.id }, { email: user.email }, { name: user.name }],
    },
    select: { id: true, citizenship: true, email: true, name: true },
  });

  if (!participant) {
    return { error: 'We did not find a participant matching your details' };
  }

  // Retrieve the application details to understand the fee structure
  const applicationDetails = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      delivery: true,
      slotsCitizen: true,
      slotsEastAfrican: true,
      slotsGlobal: true,
      owner: { select: { email: true } },
      trainingSession: {
        select: {
          startDate: true,
          endDate: true,
          venue: true,
          citizenFee: true,
          program: { select: { title: true } },
          citizenOnlineFee: true,
          eastAfricaFee: true,
          eastAfricaOnlineFee: true,
          globalParticipantFee: true,
          globalParticipantOnlineFee: true,
        },
      },
    },
  });

  if (!applicationDetails || !applicationDetails.id) {
    return { error: 'The Application was not found' };
  }

  const {
    trainingSession: {
      startDate: trainingStart,
      endDate: trainingEnd,
      venue: trainingVenue,
      program: { title },
      citizenFee,
      citizenOnlineFee,
      eastAfricaFee,
      eastAfricaOnlineFee,
      globalParticipantFee,
      globalParticipantOnlineFee,
    },
  } = applicationDetails;

  let feeAdjustment = 0;
  let slotCitizenAdjust = 0;
  let slotsEastAfricanAdjust = 0;
  let slotGlobalAdjust = 0;

  if (applicationDetails.delivery === Delivery.ONLINE) {
    switch (participant.citizenship) {
      case Citizenship.GLOBAL:
        feeAdjustment = globalParticipantOnlineFee || citizenOnlineFee || 0;
        slotGlobalAdjust = -1;
        break;
      case Citizenship.EAST_AFRICAN:
        feeAdjustment = eastAfricaOnlineFee || citizenOnlineFee || 0;
        slotsEastAfricanAdjust = -1;
        break;
      default:
        feeAdjustment = citizenOnlineFee || 0;
        slotCitizenAdjust = -1;
        break;
    }
  } else {
    switch (participant.citizenship) {
      case Citizenship.GLOBAL:
        feeAdjustment = globalParticipantFee || citizenFee || 0;
        slotGlobalAdjust = -1;
        break;
      case Citizenship.EAST_AFRICAN:
        feeAdjustment = eastAfricaFee || citizenFee || 0;
        slotsEastAfricanAdjust = -1;
        break;
      default:
        feeAdjustment = citizenFee || 0;
        slotCitizenAdjust = -1;
        break;
    }
  }

  try {
    // handle updating the application and deleting the application participant in a transation
    await db.$transaction(
      async (prisma) => {
        await prisma.applicationParticipant.delete({
          where: { id: participant.id },
        });
        await prisma.application.update({
          where: { id: applicationDetails.id },
          data: {
            slotsCitizen: { increment: slotCitizenAdjust },
            slotsEastAfrican: { increment: slotsEastAfricanAdjust },
            slotsGlobal: { increment: slotGlobalAdjust },
            applicationFee: { decrement: feeAdjustment },
            // TODO: Will the application status be reverted?
            // TODO: How will payments be handled?
            // TODO: If payment is settled then maintain the slots
            // TODO: How will receipts and offer letters be handled?
          },
        });
      },
      {
        maxWait: 500000,
        timeout: 500000,
      },
    );
  } catch (error) {
    console.log('Error removing participant: ', error);
    return {
      error:
        'There was an error with removing you from this application. Please try again later',
    };
  }

  try {
    await removeMeParticipantEmail({
      removedParticipantEmail: participant.email,
      endDate: format(trainingEnd, 'PPP'),
      startDate: format(trainingStart, 'PPP'),
      title,
      venue: trainingVenue ? formatVenues(trainingVenue) : undefined,
    });
    await removeMeOwnerEmail({
      removedPatricipantOwner: applicationDetails.owner.email,
      name: participant.name,
      endDate: format(trainingEnd, 'PPP'),
      startDate: format(trainingStart, 'PPP'),
      title,
      venue: trainingVenue ? formatVenues(trainingVenue) : undefined,
    });
    return {
      success: 'You have successfully been removed from this application',
    };
  } catch (error) {
    console.log('Error informing application participants and owner: ', error);
    return {
      error:
        'You have been removed from the application, but there was an error with sending notification emails',
    };
  }
};
