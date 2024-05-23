import { Delivery, Venue } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '../pagination.validation';
import { validString } from '../reusable.validation';

export const filterSessionsSchema = z.object({
  programTitle: z.string().optional(),
  mode: z.nativeEnum(Delivery).optional(),
  venue: z.nativeEnum(Venue).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const formSessionsSchema = filterSessionsSchema.refine(
  ({ startDate, endDate }) => {
    if (!startDate || !endDate) return true;
    return startDate < endDate;
  },
  {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  },
);

export type FilterSessionsSchema = z.infer<typeof filterSessionsSchema>;

export const viewSessionsSchema = filterSessionsSchema.extend({
  showPast: z.enum(['true', 'false']).optional(),
});
export type ViewSessionsSchema = z.infer<typeof viewSessionsSchema>;

export const fetchSessionsSchema = viewSessionsSchema.merge(paginationSchema);
export type FetchSessionsSchema = z.infer<typeof fetchSessionsSchema>;

export const pathSessionSchema = fetchSessionsSchema.extend({
  path: validString('Pass a redirect path', 1),
});
export type PathSessionSchema = z.infer<typeof pathSessionSchema>;
