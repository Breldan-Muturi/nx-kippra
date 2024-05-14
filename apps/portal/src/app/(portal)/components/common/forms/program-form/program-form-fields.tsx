import ComboboxOption from '@/components/form/combobox/combobox-options';
import { FormFieldType, SelectOptions } from '@/types/form-field.types';
import { NewProgramImageFileType } from '@/validation/programs/program.validation';

const programFields = (
  programOptions?: SelectOptions[],
  moodleCourseOptions?: SelectOptions[],
): FormFieldType<NewProgramImageFileType>[] => [
  {
    name: 'image',
    label: 'Course Image (Click to update)',
    description: 'Update the course image',
    className: 'h-full col-span-2',
    type: 'singleImage',
  },
  {
    name: 'title',
    label: 'Course Title',
    placeholder: 'Enter course title',
    type: 'text',
    className: 'col-span-2',
  },
  {
    name: 'code',
    label: 'Course Code',
    placeholder: 'Enter course code',
    type: 'text',
    className: 'col-span-2',
  },
  {
    name: 'summary',
    label: 'Course Summary',
    placeholder: 'Enter the course summary',
    type: 'textarea',
    className: 'col-span-2',
  },
  {
    name: 'serviceId',
    type: 'number',
    label: 'Service Id (KES)',
    placeholder: 'eg. 1234567',
    description: 'For KES payments',
  },
  {
    name: 'serviceIdUsd',
    type: 'number',
    label: 'Service Id (USD)',
    placeholder: 'eg. 1234567',
    description: 'For USD payments',
  },
  ...(programOptions && programOptions.length > 0
    ? ([
        {
          name: 'prerequisiteCourses',
          type: 'combobox',
          label: 'Prerequisite Courses',
          className: 'col-span-2',
          noResults: 'No program found',
          description:
            'Select courses that need to be completed before applying for this one',
          comboboxOptions: programOptions.map(
            ({ value: programValue, optionLabel }) => ({
              value: programValue,
              optionLabel,
              render: (value) => {
                const isSelected = Array.isArray(value)
                  ? value.includes(programValue)
                  : false;
                return (
                  <ComboboxOption
                    isSelected={isSelected}
                    optionLabel={optionLabel}
                  />
                );
              },
            }),
          ),
          comboboxTrigger: (value) => {
            if (!Array.isArray(value) || !value.length) {
              return 'Select prerequisite course';
            } else if (value.length > 1) {
              return `${value.length} courses selected`;
            } else {
              return programOptions.find(
                ({ value: optionValue }) => optionValue === value[0],
              )?.optionLabel;
            }
          },
          handleSelect: (selectedValue, value) => {
            const selectedProgramValue = programOptions.find(
              ({ value }) => value === selectedValue,
            )?.value;
            if (!selectedProgramValue) return value;
            if (Array.isArray(value)) {
              const newValue = value.some((v) => v === selectedValue)
                ? value.filter((v) => v !== selectedValue) // Remove if present
                : [...value, selectedProgramValue]; // Add if not present
              return newValue;
            }
            return [selectedProgramValue];
          },
        },
      ] as FormFieldType<NewProgramImageFileType>[])
    : []),
  ...(moodleCourseOptions && moodleCourseOptions.length > 0
    ? ([
        {
          name: 'moodleCourseId',
          type: 'combobox',
          label: 'Link program with eLearning course',
          noResults: 'No matching moodle course',
          className: 'col-span-2',
          description:
            'This will link the program to a specific Moodle course in order to enable enrollment',
          comboboxOptions: moodleCourseOptions.map(
            ({ value, optionLabel }) => ({
              value,
              optionLabel,
            }),
          ),
          handleSelect: (selectedValue, value) => {
            const intSelectedValue = parseInt(selectedValue);
            if (intSelectedValue === value) {
              return undefined;
            } else {
              return intSelectedValue;
            }
          },
          comboboxTrigger: (value) => {
            if (value) {
              return moodleCourseOptions.find(
                ({ value: moodleCourseValue }) =>
                  value.toString() === moodleCourseValue,
              )?.optionLabel;
            } else {
              return 'Select a moodle course';
            }
          },
        },
      ] as FormFieldType<NewProgramImageFileType>[])
    : []),
];

export default programFields;
