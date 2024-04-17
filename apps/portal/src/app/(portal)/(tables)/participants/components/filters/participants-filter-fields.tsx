import { roleOptions } from '@/helpers/enum.helpers';
import { FormFieldType } from '@/types/form-field.types';
import { FilterParticipantsType } from '@/validation/participants/participants.validation';

const filterParticipantsFields = (
  disabled: boolean,
): FormFieldType<FilterParticipantsType>[] => [
  {
    name: 'role',
    type: 'select',
    label: 'Filter by Role',
    placeholder: 'Select role',
    selectLabel: 'Roles',
    options: roleOptions,
    disabled,
  },
  {
    name: 'participantName',
    type: 'search',
    label: 'Search by name',
    placeholder: 'eg. John Doe',
    disabled,
  },
  {
    name: 'participantEmail',
    type: 'search',
    label: 'Search by email',
    placeholder: 'eg. user@email.com',
    disabled,
  },
  {
    name: 'organizationName',
    type: 'search',
    label: 'Search by organization',
    placeholder: 'eg. Organization',
    disabled,
  },
  {
    name: 'programTitle',
    type: 'search',
    label: 'Search by program',
    placeholder: 'eg. Program title',
    disabled,
  },
];

export default filterParticipantsFields;
