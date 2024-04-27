import { FormFieldType } from '@/types/form-field.types';
import { NewOrganizationImageFileType } from '@/validation/organization/organization.validation';

export const organizationFields: FormFieldType<NewOrganizationImageFileType>[] =
  [
    {
      name: 'image',
      label: 'Course Image (Click to update)',
      description: 'Update the course image',
      className: 'h-full col-span-2',
      type: 'singleImage',
    },
    {
      name: 'name',
      type: 'text',
      label: 'Enter organization name',
      placeholder: 'eg. Organization name',
    },
    {
      name: 'county',
      type: 'text',
      label: 'Enter organization county',
      placeholder: 'eg. Nairobi',
    },
    {
      name: 'organizationEmail',
      type: 'email',
      label: 'Enter organization email',
      placeholder: 'eg. info@organization.com',
    },
    {
      name: 'organizationPhone',
      type: 'tel',
      label: 'Enter organization phone no',
      placeholder: 'eg. 254711223344',
    },
    {
      name: 'organizationAddress',
      type: 'address',
      label: 'Enter organization address',
      placeholder: 'eg. Nairobi Moi-Avenue, P.O.Box 10000 - 00100',
      className: 'col-span-2',
    },
    {
      name: 'contactPersonName',
      type: 'text',
      label: 'Enter contact person name',
      placeholder: 'eg. Anne Wanjiku',
    },
    {
      name: 'contactPersonEmail',
      type: 'email',
      label: 'Enter contact person email',
      placeholder: 'anne.wanjiku@organization.com',
    },
  ];

export const organizationNoImage = organizationFields.filter(
  ({ name }) => name !== 'image',
);
