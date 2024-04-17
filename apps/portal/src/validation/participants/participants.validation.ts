import { z } from 'zod';
import { paginationSchema } from '../pagination.validation';
import { UserRole } from '@prisma/client';
import { validString } from '../reusable.validation';

export const filterParticipantsSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  participantName: z.string().optional(),
  participantEmail: z.string().optional(),
  organizationName: z.string().optional(),
  programTitle: z.string().optional(),
});
export type FilterParticipantsType = z.infer<typeof filterParticipantsSchema>;

export const participantsSearchParamsSchema = z
  .object({
    hiddenColumns: z.string().optional(),
    viewParticipant: z.string().optional(),
    updateRole: z.string().optional(),
  })
  .merge(filterParticipantsSchema)
  .merge(paginationSchema);
export type ParticipantsSearchParamsType = z.infer<
  typeof participantsSearchParamsSchema
>;

export const fetchParticipantsSchema = participantsSearchParamsSchema.extend({
  userId: z.string(),
});
export type FetchParticipantsType = z.infer<typeof fetchParticipantsSchema>;

export const fetchParticipantsRedirectSchema =
  participantsSearchParamsSchema.extend({
    path: validString('Pass a redirect path', 1),
  });
export type FetchParticipantsRedirectType = z.infer<
  typeof fetchParticipantsRedirectSchema
>;
