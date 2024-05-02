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

export const fetchParticipantsSchema = filterParticipantsSchema
  .merge(paginationSchema)
  .extend({
    hiddenColumns: z.string().optional(),
  });
export type FetchParticipantsType = z.infer<typeof fetchParticipantsSchema>;

export const pathParticipantsSchema = fetchParticipantsSchema.extend({
  path: validString('Pass a redirect path', 1),
});
export type PathParticipantsType = z.infer<typeof pathParticipantsSchema>;
