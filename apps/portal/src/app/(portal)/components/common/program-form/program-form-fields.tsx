import ComboboxOption from '@/components/form/combobox/combobox-options';
import { programServices } from '@/constants/program.constants';
import { FormFieldType, SelectOptions } from '@/types/form-field.types';
import { NewProgramFields } from '@/validation/programs/program.validation';

const programFields = (
  programOptions?: SelectOptions[],
  moodleCourseOptions?: SelectOptions[],
): FormFieldType<NewProgramFields>[] => {
  let programFields: FormFieldType<NewProgramFields>[] = [
    {
      name: 'image',
      label: 'Course Image (Click to update)',
      description: 'Update the course image',
      className: 'h-full',
      type: 'singleImage',
    },
    {
      name: 'title',
      label: 'Course Title',
      placeholder: 'Enter course title',
      type: 'text',
    },
    {
      name: 'code',
      label: 'Course Code',
      placeholder: 'Enter course code',
      type: 'text',
    },
    {
      name: 'summary',
      label: 'Course Summary',
      placeholder: 'Enter the course summary',
      type: 'textarea',
    },
    {
      name: 'serviceId',
      type: 'combobox',
      label: 'eCitizen Service Name',
      noResults: 'No matching eCitizen service names',
      description:
        'The service name links this course to eCitizen for payment recording',
      comboboxOptions: programServices.map(({ serviceId, serviceName }) => ({
        value: serviceId.toString(),
        optionLabel: serviceName,
      })),
      comboboxTrigger: (value) => {
        switch (value) {
          case undefined:
            return 'Select an eCitizen service name';
          default:
            return programServices.find(({ serviceId }) => serviceId === value)
              ?.serviceName;
        }
      },
      handleSelect: (selectedValue, value) => {
        const intSelectedValue = parseInt(selectedValue);
        if (intSelectedValue === value) {
          return undefined;
        } else {
          return intSelectedValue;
        }
      },
    },
  ];

  if (programOptions && programOptions.length > 0) {
    programFields.push({
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
    });

    if (moodleCourseOptions && moodleCourseOptions.length > 0) {
      programFields.push({
        name: 'moodleCourseId',
        type: 'combobox',
        label: 'Connect an moodle course',
        noResults: 'No matching moodle course',
        description:
          'This will link the program to a specific Moodle course in order to enable enrollment',
        comboboxOptions: moodleCourseOptions.map(({ value, optionLabel }) => ({
          value,
          optionLabel,
        })),
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
      });
    }
  }
  return programFields;
};

export default programFields;
