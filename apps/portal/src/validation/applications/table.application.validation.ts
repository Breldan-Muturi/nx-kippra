import { ApplicationStatus, SponsorType } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '../pagination.validation';

export const filterApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  type: z.nativeEnum(SponsorType).optional(),
  programTitle: z.string().optional(),
  organizationName: z.string().optional(),
  applicantName: z.string().optional(),
});
export type FilterApplicationType = z.infer<typeof filterApplicationSchema>;

export const fetchApplicationsSchema = filterApplicationSchema
  .merge(paginationSchema)
  .extend({
    hiddenColumns: z.string().optional(),
  });

export type FetchApplicationType = z.infer<typeof fetchApplicationsSchema>;

export const pathApplicationSchema = fetchApplicationsSchema.extend({
  path: z.string().min(1, 'Pass a redirect path'),
});
export type PathApplicationType = z.infer<typeof pathApplicationSchema>;
