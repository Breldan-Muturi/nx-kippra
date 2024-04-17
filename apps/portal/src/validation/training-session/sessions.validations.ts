import { z } from 'zod';
import { characterCount, requiredField } from '../reusable.validation';

export const addSessionSchema = z.object({
  programId: requiredField,
  startDate: z.string(),
  endDate: z.string(),
  venue: characterCount(5, 10),
  citizenPremiseFee: z.number(),
  foreignerPremiseFee: z.number(),
  citizenOnlineFee: z.number(),
  foreignOnlineFee: z.number(),
  premiseSlots: z.number(),
  onlineSlots: z.number(),
});

export type AddSessionForm = z.infer<typeof addSessionSchema>;
export const UpdateSessionsSchema = addSessionSchema.partial();
