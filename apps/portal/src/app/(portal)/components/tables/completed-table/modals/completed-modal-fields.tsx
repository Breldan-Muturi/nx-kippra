import { UserOption } from '@/actions/completed-programs/options.completed.actions';
import { ProgramsOption } from '@/actions/programmes/programs.options.actions';
import DropDownImage from '@/components/drop-down-options/drop-down-w-image';
import { truncateStrings } from '@/lib/utils';
import { DatePresets, FormFieldType } from '@/types/form-field.types';
import { CompletedForm } from '@/validation/completed-program/completed-program.validation';

const datePresets: DatePresets[] = [
  {
    dateLabel: 'Today',
    value: 0,
  },
  {
    dateLabel: 'Last year',
    value: -365,
  },
  {
    dateLabel: 'Last Month',
    value: -30,
  },
  {
    dateLabel: 'Last week',
    value: -7,
  },
];

const minDate = new Date();
minDate.setFullYear(minDate.getFullYear() - 5);
const maxDate = new Date();

const completedModalFields = ({
  disabled,
  programsOptions,
  userOptions,
}: {
  disabled: boolean;
  programsOptions: ProgramsOption[];
  userOptions?: UserOption[];
}): FormFieldType<CompletedForm>[] => [
  ...(!!userOptions
    ? ([
        {
          name: 'participantId',
          type: 'combobox',
          label: 'Select participant',
          noResults: 'No matching participant',
          disabled,
          comboboxTrigger: (value) => {
            if (value) {
              return userOptions.find(({ id }) => id === value)?.name;
            } else {
              return 'Select a participant';
            }
          },
          comboboxOptions: userOptions.map((user) => ({
            value: user.id,
            optionLabel: user.email,
            render: (value) => {
              const isSelected = value === user.id;
              return (
                <DropDownImage
                  image={user.image?.fileUrl}
                  info={user.email}
                  name={user.name}
                  isSelected={isSelected}
                />
              );
            },
          })),
          handleSelect: (selectedValue, value) => {
            const selectedUserId = userOptions.find(
              ({ id }) => id === selectedValue,
            )?.id;
            return selectedUserId || value;
          },
        },
      ] as FormFieldType<CompletedForm>[])
    : []),
  {
    name: 'programId',
    type: 'combobox',
    label: 'Select program',
    noResults: 'No matching program',
    disabled,
    comboboxTrigger: (value) => {
      if (value) {
        return truncateStrings(
          programsOptions.find(({ id }) => id === value)?.title as string,
          40,
        );
      } else if (programsOptions.length < 1) {
        return 'Fetching program options...';
      } else {
        return 'Select a program';
      }
    },
    comboboxOptions: programsOptions.map((program) => ({
      value: program.id,
      optionLabel: program.title,
      render: (value) => {
        const isSelected = value === program.id;
        const truncatedTitle = truncateStrings(program.title, 33);
        return (
          <DropDownImage
            info={program.code}
            name={truncatedTitle}
            image={program.image?.fileUrl}
            isSelected={isSelected}
            avatarClassName="rounded-md"
          />
        );
      },
    })),
    handleSelect: (selectedValue, value) => {
      const selectedProgramId = programsOptions.find(
        ({ id }) => selectedValue === id,
      )?.id;
      return selectedProgramId || value;
    },
  },
  {
    name: 'completionDate',
    label: 'Completion Date',
    placeholder: 'Select completion date',
    selectLabel: 'Select one',
    type: 'date',
    disabled,
    minDate,
    maxDate,
    datePresets,
  },
  {
    name: 'completionEvidence',
    type: 'multiple-files',
    label: 'Upload completion evidence',
    description: 'Allowed file types pdf, png and jpeg',
    placeholder: 'Drop a file, or click to upload',
    disabled,
  },
];

export default completedModalFields;
