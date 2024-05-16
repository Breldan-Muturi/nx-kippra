import { Citizenship } from '@prisma/client';
import { z } from 'zod';
import { email, validString } from '../reusable.validation';

export const applicationParticipantSchema = z.object({
  userId: z.string().optional(),
  isOwner: z.boolean().default(false),
  name: z.string(),
  email,
  citizenship: z.nativeEnum(Citizenship),
  nationalId: validString('Enter a valid national Id', 5),
});
export type FormApplicationParticipant = z.infer<
  typeof applicationParticipantSchema
>;

export const participantSubmitSchema = applicationParticipantSchema.extend({
  image: z.string().optional(),
});
export type ParticipantSubmitOption = z.infer<typeof participantSubmitSchema>;

export const partialParticipant = participantSubmitSchema.partial();
export type ParticipantSelectOption = z.infer<typeof partialParticipant>;
