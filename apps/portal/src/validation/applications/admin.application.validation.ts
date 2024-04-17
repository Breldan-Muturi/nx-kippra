import { Delivery, SponsorType } from '@prisma/client';
import { z } from 'zod';
import { newOrganizationSchema } from '../organization/organization.validation';
import { applicationParticipantSchema } from './participants.application.validation';
import { trainingSessionFeesSchema } from '../training-session/training-session.validation';

export const adminApplicationDetails = z.object({
  programId: z.string(),
  trainingSessionId: z.string(),
  sponsorType: z.nativeEnum(SponsorType),
  delivery: z.nativeEnum(Delivery),
});
export type AdminApplicationDetails = z.infer<typeof adminApplicationDetails>;

export const adminApplicationOrganization = z
  .object({
    isExistingOrganization: z.boolean(),
    organizationId: z.string().optional(),
  })
  .merge(newOrganizationSchema.partial());
export type AdminApplicationOrganization = z.infer<
  typeof adminApplicationOrganization
>;

export const adminApplicationParticipants = z.object({
  slotsCitizen: z.number().nonnegative().optional(),
  slotsEastAfrican: z.number().nonnegative().optional(),
  slotsGlobal: z.number().nonnegative().optional(),
  participants: z.array(applicationParticipantSchema).optional(),
});
export type AdminApplicationParticipants = z.infer<
  typeof adminApplicationParticipants
>;

export const adminApplicationSchema = adminApplicationDetails
  .merge(adminApplicationOrganization)
  .merge(adminApplicationParticipants)
  .refine(
    ({
      slotsCitizen,
      slotsEastAfrican,
      slotsGlobal,
      sponsorType,
      organizationId,
      isExistingOrganization,
    }) => {
      if (sponsorType === SponsorType.SELF_SPONSORED) {
        return [
          sponsorType === SponsorType.SELF_SPONSORED,
          !organizationId,
        ].every(Boolean);
      } else if (isExistingOrganization) {
        return [
          isExistingOrganization,
          organizationId,
          sponsorType === SponsorType.ORGANIZATION,
        ].every(Boolean);
      } else {
        return [slotsCitizen, slotsEastAfrican, slotsGlobal].some(Boolean);
      }
    },
    ({
      slotsCitizen,
      slotsEastAfrican,
      slotsGlobal,
      sponsorType,
      organizationId,
      isExistingOrganization,
    }) => {
      let message: string | undefined, path: (string | number)[] | undefined;
      if ([!slotsCitizen, !slotsEastAfrican, !slotsGlobal].every(Boolean)) {
        message = 'At least one participant required';
        path = ['sponsorType'];
      } else if (
        [organizationId, sponsorType === SponsorType.SELF_SPONSORED].every(
          Boolean,
        )
      ) {
        message =
          'Self sponsored organizations should not have organization info';
        path = ['sponsorType'];
      } else if (
        sponsorType === SponsorType.ORGANIZATION &&
        [isExistingOrganization, !organizationId].every(Boolean)
      ) {
        message = 'Select an existing organization';
        path = ['organizationId'];
      }
      return {
        message,
        path,
      };
    },
  );
export type AdminApplicationForm = z.infer<typeof adminApplicationSchema>;
