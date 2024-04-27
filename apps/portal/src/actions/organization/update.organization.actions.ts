'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnIdType } from '@/types/actions.types';
import {
  UpdateOrganizationForm,
  UpdateOrganizationImageFileType,
  updateOrganizationSchema,
} from '@/validation/organization/organization.validation';
import { OrganizationRole, UserRole } from '@prisma/client';
import { uploadImage } from '../firebase/storage.actions';

const getExistingUser = async ({
  id,
  organizationId,
}: {
  id: string;
  organizationId: string;
}) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      organizations: {
        where: { role: OrganizationRole.OWNER, userId: id, organizationId },
        take: 1,
      },
    },
  });
type UpdateOrgUser = Awaited<ReturnType<typeof getExistingUser>>;

const getExistingOrganization = async (id: string) =>
  await db.organization.findUnique({ where: { id }, select: { id: true } });
type UpdateOrg = Awaited<ReturnType<typeof getExistingOrganization>>;

export type UpdateOrganizationType =
  | { formData: FormData; data: UpdateOrganizationForm }
  | { data: UpdateOrganizationImageFileType };

export const updateOrganization = async (
  values: UpdateOrganizationType,
): Promise<ActionReturnIdType> => {
  const userId = await currentUserId();
  if (!userId)
    return { error: 'You need to be logged in to update organizations' };

  const validOrg = updateOrganizationSchema.safeParse(values.data);
  if (!validOrg.success) return { error: 'Invalid fields submission' };

  let existingUser: UpdateOrgUser, existingOrg: UpdateOrg;
  try {
    [existingUser, existingOrg] = await Promise.all([
      getExistingUser({ id: userId, organizationId: validOrg.data.id }),
      getExistingOrganization(validOrg.data.id),
    ]);
  } catch (error) {
    console.error('Error validating submission: ', error);
    return {
      error:
        'Failed to validate this request due to a server error. Please try again later',
    };
  }

  if (!existingUser || !existingUser.id)
    return {
      error: 'Could not authorize this user account. Please try again later',
    };
  if (
    existingUser.role !== UserRole.ADMIN &&
    existingUser.organizations.length < 1
  )
    return { error: 'Your account is not authorized to perform this update' };

  if (!existingOrg || !existingOrg.id)
    return { error: 'Organization not found. Please try again later' };

  let imgUrl: string | undefined;
  if ('formData' in values) {
    const formData = values.formData;
    const image = formData.get('image') as File;
    if (!!image) {
      const uploadReturn = await uploadImage({
        buffer: Buffer.from(await image.arrayBuffer()),
        contentType: image.type,
        fileName: image.name,
      });
      if ('error' in uploadReturn) return { error: uploadReturn.error };
      imgUrl = uploadReturn.fileUrl;
    }
  }

  const {
    organizationAddress,
    organizationEmail,
    organizationPhone,
    ...orgInfo
  } = validOrg.data;
  try {
    const updatedOrganization = await db.organization.update({
      where: { id: existingOrg.id },
      data: {
        address: organizationAddress,
        email: organizationEmail,
        phone: organizationPhone,
        image: imgUrl,
        ...orgInfo,
      },
    });
    return {
      success: 'Organization updated successfully',
      recordId: updatedOrganization.id,
    };
  } catch (error) {
    console.error(
      'Failed to update organization due to a server error: ',
      error,
    );
    return {
      error:
        'Failed to update organization due to a server error. Please try again later.',
    };
  }
};
