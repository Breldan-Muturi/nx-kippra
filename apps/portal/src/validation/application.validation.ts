import {
  ApplicationStatus,
  Citizenship,
  Delivery,
  Prisma,
  SponsorType,
} from "@prisma/client";
import { z } from "zod";
import { newOrganizationSchema } from "./organization.validation";
import { characterCount, email, validString } from "./reusable.validation";
import { paginationSchema } from "./pagination.validation";

export const applicationParticipantSchema = z.object({
  userId: z.string().optional(),
  name: z.string(),
  email,
  citizenship: z.nativeEnum(Citizenship),
  nationalId: validString("Enter a valid national Id", 5),
  organizationId: z.string().optional(),
  organizationName: characterCount(4, 100),
});
export type ParticipantSubmitOption = z.infer<
  typeof applicationParticipantSchema
> & {
  image?: string;
};

export const partialParticipant = applicationParticipantSchema.partial();
export type ParticipantSelectOption = z.infer<typeof partialParticipant> & {
  image?: string;
};

export type ApplicantValidationForm = z.infer<
  typeof applicationParticipantSchema
>;

export const newApplicationSchema = z
  .object({
    sponsorType: z.nativeEnum(SponsorType),
    delivery: z.nativeEnum(Delivery),
    isExistingOrganization: z.boolean(),
    organizationId: z.string().nullable().optional(),
    newOrganization: z
      .lazy(() => newOrganizationSchema)
      .optional()
      .nullable(),
    slotsCitizen: z.number().nonnegative().optional(),
    slotsEastAfrican: z.number().nonnegative().optional(),
    slotsGlobal: z.number().nonnegative().optional(),
    participants: z.array(applicationParticipantSchema),
    trainingSessionId: z.string(),
    citizenFee: z.number().nonnegative(),
    eastAfricanFee: z.number().nonnegative().optional(),
    globalFee: z.number().nonnegative().optional(),
    trainingSessionStartDate: z.date(),
    trainingSessionEndDate: z.date(),
    programTitle: z.string(),
  })
  // Checks the type of sponsor and whether the organization is added correctly
  .refine(
    ({
      sponsorType,
      isExistingOrganization,
      newOrganization,
      organizationId,
      slotsCitizen,
      slotsEastAfrican,
      slotsGlobal,
    }) => {
      const hasParticipant = [slotsCitizen, slotsEastAfrican, slotsGlobal].some(
        Boolean,
      );
      const validNewOrganization =
        newOrganizationSchema.safeParse(newOrganization);
      const selfSponsored = [
        sponsorType === SponsorType.SELF_SPONSORED,
        organizationId === null,
        newOrganization === null,
      ].every(Boolean);
      const existingOrganization = [
        isExistingOrganization,
        sponsorType === SponsorType.ORGANIZATION,
        newOrganization === null,
      ].every(Boolean);
      const validOrganization = [
        sponsorType === SponsorType.ORGANIZATION,
        validNewOrganization.success,
      ].every(Boolean);
      if (!hasParticipant) {
        return false;
      } else if (sponsorType === SponsorType.SELF_SPONSORED) {
        // Self-sponsored organizations should have null organization details
        return selfSponsored;
        // If existing organization is selected, newOrganization is null, organizationId is not null
      } else if (isExistingOrganization) {
        return existingOrganization;
        // Otherwise, newOrganization should not be null, and organizationId should be null
      } else {
        return validOrganization;
      }
    },
    ({
      sponsorType,
      isExistingOrganization,
      slotsCitizen,
      slotsEastAfrican,
      slotsGlobal,
      organizationId,
      newOrganization,
    }) => {
      const hasParticipant = [slotsCitizen, slotsEastAfrican, slotsGlobal].some(
        Boolean,
      );
      const validNewOrganization =
        newOrganizationSchema.safeParse(newOrganization);
      const selfSponsored = [
        organizationId === null,
        newOrganization === null,
      ].every(Boolean);
      const existingOrganization = [
        sponsorType === SponsorType.ORGANIZATION,
        newOrganization === null,
      ].every(Boolean);
      const validOrganization = [
        sponsorType === SponsorType.ORGANIZATION,
        validNewOrganization.success,
      ].every(Boolean);
      let message: string | undefined, path: (string | number)[] | undefined;
      if (!hasParticipant) {
        message = "At least one participant required";
        path = ["sponsorType"];
      } else if (sponsorType === SponsorType.SELF_SPONSORED && !selfSponsored) {
        message =
          "Self sponsored organizations should not have organization info";
        path = ["sponsorType"];
      } else if (isExistingOrganization && !existingOrganization) {
        (message =
          "Select an organization from the dropdown and clear the new organization"),
          (path = ["organizationId"]);
      } else if (!validOrganization) {
        message = "Complete the form for the new organization details";
        path = ["isExistingOrganization"];
      }
      return {
        message,
        path,
      };
    },
  );

export type NewApplicationForm = z.infer<typeof newApplicationSchema>;

export type ValidatedApplicationForm = Omit<
  NewApplicationForm,
  | "isExistingOrganization"
  | "isOnlyParticipant"
  | "participants"
  | "citizenFee"
  | "eastAfricanFee"
  | "globalFee"
> & {
  applicationParticipants:
    | Prisma.ApplicationParticipantCreateNestedManyWithoutApplicationInput
    | undefined;
  participantEmails: string[];
  userId: string;
  trainingFee: number;
};

export type ApplicationTypeForm = Pick<
  NewApplicationForm,
  "sponsorType" | "delivery"
>;
export type OrganizationDetailsForm = Pick<
  NewApplicationForm,
  "isExistingOrganization" | "organizationId" | "newOrganization"
>;

export const filterApplicationSchema = z.object({
  path: z.string().min(1, "Pass a redirect path"),
  status: z.nativeEnum(ApplicationStatus).optional(),
  type: z.nativeEnum(SponsorType).optional(),
  programId: z.string().optional(),
  organizationId: z.string().optional(),
  applicantId: z.string().optional(),
  hiddenColumns: z.string().optional(),
});

const viewApplication = z.string().optional();

export const adminActionsSchema = z.object({
  viewApplication,
  approveApplication: z.string().optional(),
  rejectApplication: z.string().optional(),
  sendEmail: z.string().optional(),
});

export const userActionsSchema = z.object({
  viewApplication,
  payApplication: z.string().optional(),
  removeApplication: z.string().optional(),
  deleteApplication: z.string().optional(),
});

export const filterUserApplicationSchema = filterApplicationSchema
  .merge(userActionsSchema)
  .merge(paginationSchema);
export type FilterUserApplicationType = z.infer<
  typeof filterUserApplicationSchema
>;

export const filterAdminApplicationSchema = filterApplicationSchema
  .merge(adminActionsSchema)
  .merge(paginationSchema);
export type FilterAdminApplicationType = z.infer<
  typeof filterAdminApplicationSchema
>;

export type FilterApplicationType = Omit<
  z.infer<typeof filterApplicationSchema>,
  "hiddenColumns"
>;

export const filterPaginateApplicationSchema =
  filterApplicationSchema.merge(paginationSchema);
export type FilterPaginateAppliationType = z.infer<
  typeof filterPaginateApplicationSchema
>;

export type DefaultApplicationParams = Omit<
  FilterPaginateAppliationType,
  "path"
>;
export type ViewApplicationParams = DefaultApplicationParams & {
  viewApplication: string;
};
export type ApproveApplicationParams = DefaultApplicationParams & {
  approveApplication: string;
};
export type RejectApplicationParams = DefaultApplicationParams & {
  rejectApplication: string;
};
export type EmailApplicationParams = DefaultApplicationParams & {
  sendEmail: string;
};
export type DeleteApplicationParams = DefaultApplicationParams & {
  deleteApplication: string;
};
export type RemoveApplicationParams = DefaultApplicationParams & {
  removeApplication: string;
};
export type PayApplicationParams = DefaultApplicationParams & {
  payApplication: string;
};
