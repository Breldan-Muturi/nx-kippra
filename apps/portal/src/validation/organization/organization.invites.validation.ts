import { z } from 'zod';
import { email, validString } from '../reusable.validation';
import { paginationSchema } from '../pagination.validation';

export const filterInvitesSchema = z.object({
  email: email.optional(),
});
export type FilterInvitesSchema = z.infer<typeof filterInvitesSchema>;

export const fetchInvitesSchema = filterInvitesSchema.merge(paginationSchema);
export type FetchInvitesSchema = z.infer<typeof fetchInvitesSchema>;

export const pathInvitesSchema = fetchInvitesSchema.extend({
  path: validString('Pass a redirect path', 1),
});
export type PathInvitesSchema = z.infer<typeof pathInvitesSchema>;
