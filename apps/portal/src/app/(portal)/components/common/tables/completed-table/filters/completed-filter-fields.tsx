import { completedStatusOptions } from '@/helpers/enum.helpers';
import { FormFieldType } from '@/types/form-field.types';
import { FilterCompletedSchema } from '@/validation/completed-program/completed-program.validation';

const completedFilterFields = (
  disabled: boolean,
): FormFieldType<FilterCompletedSchema>[] => [
  {
    name: 'status',
    type: 'select',
    label: 'Filter by Status',
    placeholder: 'Select status',
    selectLabel: 'Statuses',
    options: completedStatusOptions,
    disabled,
  },
  {
    name: 'participantName',
    type: 'search',
    label: 'Search by participant',
    placeholder: 'eg. John Doe',
    disabled,
  },
  {
    name: 'programName',
    type: 'search',
    label: 'Search by program',
    placeholder: 'eg. program name/code',
    disabled,
  },
  {
    name: 'organizationName',
    type: 'search',
    label: 'Search by organization',
    placeholder: 'eg. Organization',
    disabled,
  },
];

export default completedFilterFields;
