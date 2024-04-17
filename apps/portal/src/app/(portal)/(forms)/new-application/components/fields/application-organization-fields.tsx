import { FormFieldType, SelectOptions } from '@/types/form-field.types';
import { AdminApplicationOrganization } from '@/validation/applications/admin.application.validation';
import { NewOrganizationForm } from '@/validation/organization/organization.validation';

type ApplicationOrganizationFieldsProps = {
  existingOrganization: boolean;
  organizationOptions: SelectOptions[];
};

const newOrganizationFields: FormFieldType<NewOrganizationForm>[] = [
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

const applicationOrganizationFields = ({
  existingOrganization,
  organizationOptions,
}: ApplicationOrganizationFieldsProps): FormFieldType<AdminApplicationOrganization>[] => {
  const fields: FormFieldType<AdminApplicationOrganization>[] = [
    {
      name: 'isExistingOrganization',
      type: 'switch',
      label: 'Select existing organization',
      description: 'Make this application with an existing organization',
      className: 'col-span-2 bg-background',
    },
  ];
  if (existingOrganization) {
    fields.push({
      name: 'organizationId',
      label: 'Select sponsor organization',
      placeholder: 'Select organization',
      selectLabel: 'Sponsor organizations',
      type: 'select',
      options: organizationOptions,
      className: 'col-span-2',
    });
  } else {
    fields.push(...newOrganizationFields);
  }

  return fields;
};

export default applicationOrganizationFields;
