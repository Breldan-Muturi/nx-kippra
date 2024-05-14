import { ProgramOption } from '@/actions/applications/form.applications.actions';
import DropDownImage from '@/components/drop-down-options/drop-down-w-image';
import {
  deliveryModeOptions,
  sponsorTypeOptions,
} from '@/helpers/enum.helpers';
import { FormFieldType, SelectOptions } from '@/types/form-field.types';
import { AdminApplicationDetails } from '@/validation/applications/admin.application.validation';
import { Delivery } from '@prisma/client';

type ApplicationDetailProps = {
  disabled: boolean;
  programOptions?: ProgramOption[];
  trainingSessionOptions: SelectOptions[];
  isDisableDelivery: boolean;
};

const applicationDetailsFields = ({
  disabled,
  programOptions,
  trainingSessionOptions,
  isDisableDelivery,
}: ApplicationDetailProps): FormFieldType<AdminApplicationDetails>[] => [
  ...(!!programOptions
    ? ([
        {
          name: 'programId',
          type: 'combobox',
          label: 'Select program',
          noResults: 'No matching program',
          className: 'col-span-2',
          disabled,
          comboboxTrigger: (value) => {
            if (value) {
              return programOptions.find(({ id }) => id === value)?.title;
            }
            return 'Select a program';
          },
          comboboxOptions: programOptions.map(
            ({ imgUrl, code, title, id }, i) => ({
              value: id,
              optionLabel: title,
              render: (value) => {
                const isSelected = value === id;
                console.log('Program title: ', title);
                return (
                  <DropDownImage
                    key={`${i}${id}`}
                    image={imgUrl ?? undefined}
                    info={code}
                    name={title}
                    isSelected={isSelected}
                    avatarClassName="rounded-md"
                  />
                );
              },
            }),
          ),
          handleSelect: (selectedValue, value) => {
            if (selectedValue === value) return value;
            return selectedValue;
          },
        },
        {
          name: 'trainingSessionId',
          type: 'select',
          label: 'Select training session',
          selectLabel: 'Upcoming training sessions',
          placeholder: 'Training session',
          className: 'col-span-2',
          disabled,
          options: trainingSessionOptions,
        },
      ] as FormFieldType<AdminApplicationDetails>[])
    : []),
  {
    name: 'sponsorType',
    type: 'select',
    label: 'Select sponsor type',
    placeholder: 'Sponsor types',
    options: sponsorTypeOptions,
  },
  {
    name: 'delivery',
    type: 'select',
    label: 'Select delivery mode',
    placeholder: 'Select delivery mode',
    disabled: disabled || isDisableDelivery,
    options: deliveryModeOptions.filter(
      ({ value }) => value !== Delivery.BOTH_MODES,
    ),
  },
];

export default applicationDetailsFields;
