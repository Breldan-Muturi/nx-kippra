'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnIdType } from '@/types/actions.types';
import { NewOrganizationForm } from '@/validation/organization/organization.validation';
import { OrganizationRole } from '@prisma/client';
import { v4 } from 'uuid';
import { FilesUploadReturn, filesUpload } from '../firebase/storage.actions';

const getExistingUser = async (userId: string) =>
  await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
type NewOrganizationExistingUser = Awaited<ReturnType<typeof getExistingUser>>;

const getExistingOrganizations = async (organzation: NewOrganizationForm) =>
  await db.organization.findMany({
    where: {
      OR: [
        { name: organzation.name },
        { email: organzation.organizationEmail },
        { phone: organzation.organizationPhone },
      ],
    },
    select: { email: true, name: true, phone: true },
  });
type NewOrgValidateOrg = Awaited<ReturnType<typeof getExistingOrganizations>>;

export type UserNewOrganizationParams = {
  organization: NewOrganizationForm;
  formData: FormData;
};

export const userNewOrganization = async ({
  organization,
  formData,
}: UserNewOrganizationParams): Promise<ActionReturnIdType> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to add an organization' };

  const image = formData.get('image') as File;
  const id = v4();

  let existingUser: NewOrganizationExistingUser,
    existingOrganizations: NewOrgValidateOrg,
    uploadReturn: FilesUploadReturn;
  try {
    [existingUser, existingOrganizations, uploadReturn] = await Promise.all([
      getExistingUser(userId),
      getExistingOrganizations(organization),
      filesUpload([image], `organizations/${id}`),
    ]);
  } catch (error) {
    console.error('Could not validate details: ', error);
    return {
      error:
        'Failed to validate form details due to a server error. Please try again later',
    };
  }

  if (!existingUser || !existingUser.id)
    return { error: 'User account not found. Please try again later' };

  if ('error' in uploadReturn)
    return {
      error:
        'Failed to upload the image due to a server error. Please try again later',
    };

  const matchingEmail = !!existingOrganizations.find(
    ({ email }) => email === organization.organizationEmail,
  );
  const matchingName = !!existingOrganizations.find(
    ({ name }) => name === organization.name,
  );
  const matchingPhone = !!existingOrganizations.find(
    ({ phone }) => phone === organization.organizationPhone,
  );

  const matches = [];
  if (matchingEmail) matches.push('email');
  if (matchingName) matches.push('name');
  if (matchingPhone) matches.push('phone number');

  if (matches.length > 0) {
    const matchList = matches.join(', ').replace(/, ([^,]*)$/, ', and $1');
    return {
      error: `An organization with the same ${matchList} already exists. Please update this information and try again.`,
    };
  }

  try {
    const newOrganization = await db.organization.create({
      data: {
        id,
        image: { create: uploadReturn[0] },
        address: organization.organizationAddress,
        email: organization.organizationEmail,
        phone: organization.organizationPhone,
        users: {
          create: {
            role: OrganizationRole.OWNER,
            user: { connect: { id: existingUser.id } },
          },
        },
        contactPersonEmail: organization.contactPersonEmail,
        contactPersonName: organization.contactPersonName,
        county: organization.county,
        name: organization.name,
      },
    });
    return {
      success: 'New organization created successfully',
      recordId: newOrganization.id,
    };
  } catch (error) {
    console.error('There was an error creating this organization: ', error);
    return { error: 'Something went wrong creating the organization' };
  }
};
