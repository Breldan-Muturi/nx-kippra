import { organizationRoleOptions } from '@/helpers/enum.helpers';
import { FormFieldType } from '@/types/form-field.types';
import { FilterOrganizationsType } from '@/validation/organization/organization.validation';

const organizationFilterFields = (
  disabled: boolean,
): FormFieldType<FilterOrganizationsType>[] => [
  {
    name: 'role',
    type: 'select',
    label: 'Filter by Role',
    placeholder: 'Select role',
    selectLabel: 'Roles',
    description: 'Enter your role in this organization',
    options: organizationRoleOptions,
    disabled,
  },
  {
    name: 'name',
    type: 'search',
    label: 'Search by name',
    placeholder: 'eg. Organization name',
    disabled,
  },
  {
    name: 'address',
    type: 'search',
    label: 'Search by address',
    placeholder: 'eg. Nairobi, Moi Avenue',
    disabled,
  },
  {
    name: 'county',
    type: 'search',
    label: 'Search by county',
    placeholder: 'eg. Mombasa',
    disabled,
  },
  {
    name: 'contactEmail',
    type: 'search',
    label: 'Search by email',
    placeholder: 'eg. info@org.com',
    disabled,
  },
];

export default organizationFilterFields;
