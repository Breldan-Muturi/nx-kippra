import { CompletionStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '../pagination.validation';
import { validFileUpload, validString } from '../reusable.validation';

export const filterCompletedSchema = z.object({
  status: z.nativeEnum(CompletionStatus).optional(),
  programName: z.string().optional(),
  participantName: z.string().optional(),
  organizationName: z.string().optional(),
  // These are added in one calendar filter widget
  // completionStart: z.date().optional(),
  // completionEnd: z.date().optional(),
});
export type FilterCompletedSchema = z.infer<typeof filterCompletedSchema>;

export const fetchCompletedSchema =
  filterCompletedSchema.merge(paginationSchema);
export type FetchCompletedSchema = z.infer<typeof fetchCompletedSchema>;

export const pathCompletedSchema = fetchCompletedSchema.extend({
  path: validString('Pass a redirect path', 1),
});
export type PathCompletedSchema = z.infer<typeof pathCompletedSchema>;

export const rejectCompletedSchema = z.object({
  message: z.string().optional(),
});
export type RejectCompletedSchema = z.infer<typeof rejectCompletedSchema>;

export const completedSchema = z.object({
  programId: z.string(),
  participantId: z.string(),
  completionDate: z.date(),
  completionEvidence: validFileUpload(false),
});
export type CompletedSchema = z.infer<typeof completedSchema>;

export const updateCompletedSchema = completedSchema.extend({
  id: validString('Pass the id for the completed program to update', 1),
});
export type UpdateCompletedSchema = z.infer<typeof updateCompletedSchema>;
