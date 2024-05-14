import { z } from 'zod';

export const approvalSchema = z.object({
  id: z.string(),
  applicationFee: z.number().positive(),
  message: z
    .string()
    .max(500, 'Message should not exceed 500 characters')
    .optional(),
});
export type ApprovalSchema = z.infer<typeof approvalSchema>;
