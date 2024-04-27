import { z } from 'zod';
import {
  characterCount,
  email,
  validImageUpload,
  validString,
  withIdSchema,
} from '../reusable.validation';
import { OrganizationRole } from '@prisma/client';
import { paginationSchema } from '../pagination.validation';
import { RemoveOrgData } from '@/actions/organization/remove.organization.actions';

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
export const updateOrganizationSchema = newOrganizationSchema.extend({
  id: validString('An organization id is required', 1),
});
export type UpdateOrganizationForm = z.infer<typeof updateOrganizationSchema>;

export const newOrganizationImageFileSchema = newOrganizationSchema.extend({
  image: validImageUpload(false),
});
export type NewOrganizationImageFileType = z.infer<
  typeof newOrganizationImageFileSchema
>;
export const updateOrganizationImageFileSchema =
  newOrganizationImageFileSchema.extend({
    id: validString('An organization id is required', 1),
  });
export type UpdateOrganizationImageFileType = z.infer<
  typeof updateOrganizationImageFileSchema
>;

export const filterOrganizationsSchema = z.object({
  role: z.nativeEnum(OrganizationRole).optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  county: z.string().optional(),
  contactEmail: z.string().optional(),
});
export type FilterOrganizationsType = z.infer<typeof filterOrganizationsSchema>;

export const organizationsTableSchema = filterOrganizationsSchema
  .merge(paginationSchema)
  .extend({
    hiddenColumns: z.string().optional(),
  });
export type OrganizationTableSchema = z.infer<typeof organizationsTableSchema>;

export const organizationPathSchema = organizationsTableSchema.extend({
  path: validString('Pass a redirect path', 1),
});
export type OrganizationPathSchema = z.infer<typeof organizationPathSchema>;

export const createRemoveOrgSchema = ({
  otherOrgUsers,
  updateEmail,
  updateName,
}: Omit<RemoveOrgData, 'deleteOrg' | 'orgId'>) =>
  z
    .object({
      newEmail: email.optional(),
      newName: characterCount(6, 20).optional(),
      newOwnerId: z.string().optional(),
    })
    .refine(
      (data) => {
        if (updateName && !data.newName) return false;
        if (updateEmail && !data.newEmail) return false;
        if (!!otherOrgUsers && !data.newOwnerId) return false;
        return true;
      },
      (data) => {
        let message: string | undefined, path: (string | number)[] | undefined;
        if (updateName && !data.newName) {
          message = 'New organization contact person name required';
          path = ['newName'];
        }
        if (updateEmail && !data.newEmail) {
          message = 'New organization contact person email required';
          path = ['newEmail'];
        }
        if (!!otherOrgUsers && !data.newOwnerId) {
          message = 'New organization owner required';
          path = ['newOwnerId'];
        }
        return { message, path };
      },
    );
export type RemoveOrgInfo = z.infer<ReturnType<typeof createRemoveOrgSchema>>;
