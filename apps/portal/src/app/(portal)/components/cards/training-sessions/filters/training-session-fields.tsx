import { FilterSessionValues } from '@/actions/training-session/fetch.training-sessions.actions';
import { DatePresets, FormFieldType } from '@/types/form-field.types';
import { FilterSessionsSchema } from '@/validation/training-session/fetch.sessions.validations';

const datePresets: DatePresets[] = [
  {
    dateLabel: 'Today',
    value: 0,
  },
  {
    dateLabel: 'Tomorrow',
    value: 1,
  },
  {
    dateLabel: 'In 3 days',
    value: 3,
  },
  {
    dateLabel: 'In a week',
    value: 7,
  },
];

const trainingFilterFields = ({
  showProgram,
  venueOptions,
  modeOptions,
  firstStartDate,
  lastStartDate,
  firstEndDate,
  lastEndDate,
}: FilterSessionValues): FormFieldType<FilterSessionsSchema>[] => [
  ...(!showProgram
    ? ([
        {
          name: 'programTitle',
          type: 'search',
          label: 'Search by program title',
          placeholder: 'eg program title',
          className: 'w-full lg:flex-1',
        },
      ] as FormFieldType<FilterSessionsSchema>[])
    : []),
  ...(venueOptions.length > 1
    ? ([
        {
          name: 'venue',
          type: 'select',
          label: 'Filter by venue',
          selectLabel: 'Select Venue',
          placeholder: 'Select Venue',
          options: venueOptions,
          className: 'w-full lg:flex-1',
        },
      ] as FormFieldType<FilterSessionsSchema>[])
    : []),
  ...(modeOptions.length > 1
    ? ([
        {
          name: 'mode',
          type: 'select',
          label: 'Filter by mode',
          selectLabel: 'Select mode',
          placeholder: 'Delivery mode',
          options: modeOptions,
          className: 'w-full lg:flex-1',
        },
      ] as FormFieldType<FilterSessionsSchema>[])
    : []),
  {
    name: 'startDate',
    label: 'Session start date',
    placeholder: 'Select start date',
    selectLabel: 'Select one',
    type: 'date',
    minDate: firstStartDate,
    maxDate: lastStartDate,
    datePresets,
    className: 'w-full lg:flex-1',
  },
  {
    name: 'endDate',
    label: 'Session end date',
    placeholder: 'Select end date',
    selectLabel: 'Select one',
    type: 'date',
    minDate: firstEndDate,
    maxDate: lastEndDate,
    datePresets,
    className: 'w-full lg:flex-1',
  },
];

export default trainingFilterFields;
