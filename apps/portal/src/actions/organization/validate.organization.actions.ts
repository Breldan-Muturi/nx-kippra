"use server";

import { db } from "@/lib/db";
import {
  NewOrganizationForm,
  newOrganizationSchema,
} from "@/validation/organization.validation";

export const validateNewOrganization = async (data: NewOrganizationForm) => {
  const validatedFields = newOrganizationSchema.safeParse(data);
  if (!validatedFields.success) return { error: "Invalid Fields" };
  const {
    organizationAddress,
    organizationEmail,
    organizationPhone,
    ...organizationFields
  } = validatedFields.data;

  const existingOrganizationNamePromise = db.organization.findUnique({
    where: { name: organizationFields.name },
  });
  const existingOrganizationPhonePromise = db.organization.findUnique({
    where: { phone: organizationPhone },
  });
  const existingOrganizationEmailPromise = db.organization.findUnique({
    where: { email: organizationEmail.toLowerCase() },
  });

  const [
    existingOrganizationName,
    existingOrganizationPhone,
    existingOrganizationEmail,
  ] = await Promise.all([
    existingOrganizationNamePromise,
    existingOrganizationPhonePromise,
    existingOrganizationEmailPromise,
  ]);

  if (existingOrganizationName)
    return { error: "An organization with the same name already exists" };
  if (existingOrganizationPhone)
    return {
      error: "An organization with the same phone number already exists",
    };
  if (existingOrganizationEmail)
    return { error: "An organization with the same email already exists" };

  return {
    success: "New organization is valid",
    validatedData: validatedFields.data,
  };
};
