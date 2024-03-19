"use server";

import { currentUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewOrganizationForm } from "@/validation/organization.validation";
import { Organization, OrganizationRole } from "@prisma/client";
import { validateNewOrganization } from "./validate.organization.actions";

export const userNewOrganization = async (data: {
  organization: NewOrganizationForm;
  userId?: string;
}): Promise<{
  success?: string;
  error?: string;
  organization?: Organization;
}> => {
  const { organization, userId: userIdProp } = data;
  let userId: string = "";

  if (userIdProp) {
    userId = userIdProp;
  } else {
    userId = (await currentUserId()) || "";
    if (userId === "") {
      return { error: "You are not authorized" };
    }
  }

  const validatedResponse = await validateNewOrganization(organization);
  if (validatedResponse.error) return { error: validatedResponse.error };
  if (!validatedResponse.validatedData)
    return { error: "Could not validate new organization" };
  const {
    organizationAddress,
    organizationEmail,
    organizationPhone,
    ...organizationFields
  } = validatedResponse.validatedData;
  try {
    const newOrganization = await db.$transaction(async (prisma) => {
      const createOrganization = await prisma.organization.create({
        data: {
          address: organizationAddress,
          email: organizationEmail,
          phone: organizationPhone,
          ...organizationFields,
        },
      });

      await prisma.userOrganization.create({
        data: {
          userId,
          organizationId: createOrganization.id,
          role: OrganizationRole.OWNER,
        },
      });

      return createOrganization;
    });

    return {
      success: "New organization created successfully",
      organization: newOrganization,
    };
  } catch {
    return { error: "Something went wrong creating the organization" };
  }
};
