"use server";

import {
  NewApplicationForm,
  ValidatedApplicationForm,
  newApplicationSchema,
} from "@/validation/application.validation";
import { SponsorType } from "@prisma/client";
import { validateNewOrganization } from "../organization/validate.organization.actions";
import { currentUserId } from "@/lib/auth";
import { ActionReturnType } from "@/types/action-return.types";
import { db } from "@/lib/db";

type ValidateApplicationType = ActionReturnType & {
  validatedApplication?: ValidatedApplicationForm;
};

export const validateApplication = async (
  data: NewApplicationForm,
): Promise<ValidateApplicationType> => {
  const userId = await currentUserId();
  if (!userId) {
    return { error: "Only authenticated users can create applications" };
  }

  // const { id: userId, email } = user;
  const validFields = newApplicationSchema.safeParse(data);
  // Consider returning Zod Errors
  if (!validFields.success) return { error: "Invalid fields" };

  const {
    delivery,
    sponsorType,
    trainingSessionId,
    organizationId,
    isExistingOrganization,
    newOrganization,
    participants,
    citizenFee,
    eastAfricanFee,
    globalFee,
    trainingSessionStartDate,
    trainingSessionEndDate,
    programTitle,
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
  } = validFields.data;

  const applicationFee =
    citizenFee * (slotsCitizen ? slotsCitizen : 0) +
    (eastAfricanFee ? eastAfricanFee : citizenFee) *
      (slotsEastAfrican ? slotsEastAfrican : 0) +
    (globalFee ? globalFee : citizenFee) * (slotsGlobal ? slotsGlobal : 0);

  let validNewOrganization = null;

  if (!isExistingOrganization && sponsorType === SponsorType.ORGANIZATION) {
    if (newOrganization) {
      const validOrganization = await validateNewOrganization(newOrganization);
      if (validOrganization.validatedData) {
        validNewOrganization = validOrganization.validatedData;
      } else if (validOrganization.error) {
        return { error: validOrganization.error };
      }
    } else {
      return { error: "New organization fields are invalid" };
    }
  }

  // Prepare participant data
  const applicationParticipantData = await Promise.all(
    participants.map(
      async ({
        userId,
        organizationId,
        name,
        email,
        citizenship,
        nationalId,
        organizationName,
      }) => {
        const userExists = userId
          ? await db.user.findUnique({
              where: { id: userId },
              select: { id: true },
            })
          : null;
        const organizationExists = organizationId
          ? await db.organization.findUnique({
              where: { id: organizationId },
              select: { id: true },
            })
          : null;
        return {
          userId: userExists ? userId : null,
          name,
          email,
          citizenship,
          nationalId,
          organizationId: organizationExists ? organizationId : null,
          organizationName,
          attendanceConfirmed: false,
        };
      },
    ),
  );

  const applicationData: ValidatedApplicationForm = {
    delivery,
    sponsorType,
    trainingSessionId,
    organizationId: isExistingOrganization ? organizationId : null,
    newOrganization: validNewOrganization,
    applicationParticipants: {
      createMany: {
        data: applicationParticipantData,
      },
    },
    userId,
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
    participantEmails: applicationParticipantData.map(({ email }) => email),
    trainingFee: applicationFee,
    trainingSessionStartDate,
    trainingSessionEndDate,
    programTitle,
  };

  return {
    success: "This application is valid, proceed to confirm",
    validatedApplication: applicationData,
  };
};
