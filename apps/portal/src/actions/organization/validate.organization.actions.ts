'use server';

import { db } from '@/lib/db';
import {
  NewOrganizationForm,
  newOrganizationSchema,
} from '@/validation/organization/organization.validation';

export type ValidOrganizationReturn =
  | { error: string }
  | { success: string; validNewOrganization: NewOrganizationForm };

export const validateNewOrganization = async (
  data: NewOrganizationForm,
): Promise<ValidOrganizationReturn> => {
  const validatedFields = newOrganizationSchema.safeParse(data);
  if (!validatedFields.success) return { error: 'Invalid Fields' };
  const {
    organizationAddress,
    organizationEmail,
    organizationPhone,
    ...organizationFields
  } = validatedFields.data;

  const [
    existingOrganizationName,
    existingOrganizationPhone,
    existingOrganizationEmail,
  ] = await Promise.all([
    db.organization.findUnique({
      where: { name: organizationFields.name },
    }),
    db.organization.findUnique({
      where: { phone: organizationPhone },
    }),
    db.organization.findUnique({
      where: { email: organizationEmail.toLowerCase() },
    }),
  ]);

  if (existingOrganizationName)
    return { error: 'An organization with the same name already exists' };
  if (existingOrganizationPhone)
    return {
      error: 'An organization with the same phone number already exists',
    };
  if (existingOrganizationEmail)
    return { error: 'An organization with the same email already exists' };

  return {
    success: 'New organization is valid',
    validNewOrganization: validatedFields.data,
  };
};
