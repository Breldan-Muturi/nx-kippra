import { z } from 'zod';
import { characterCount, email } from '../reusable.validation';

export const newOrganizationSchema = z.object({
  name: characterCount(5, 80),
  county: characterCount(5, 40),
  organizationEmail: email,
  organizationPhone: characterCount(12, 12, 'Enter a valid phone number'),
  organizationAddress: characterCount(10, 80),
  contactPersonName: characterCount(8, 40),
  contactPersonEmail: email,
});
export type NewOrganizationForm = z.infer<typeof newOrganizationSchema>;
