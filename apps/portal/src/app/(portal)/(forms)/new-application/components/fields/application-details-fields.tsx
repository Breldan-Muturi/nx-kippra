import {
  deliveryModeOptions,
  sponsorTypeOptions,
} from '@/helpers/enum.helpers';
import { FormFieldType, SelectOptions } from '@/types/form-field.types';
import { AdminApplicationDetails } from '@/validation/applications/admin.application.validation';
import { Delivery } from '@prisma/client';

type ApplicationDetailProps = {
  disabled: boolean;
  programOptions: SelectOptions[];
  trainingSessionOptions: SelectOptions[];
  isDisableDelivery: boolean;
};

const applicationDetailsFields = ({
  disabled,
  programOptions,
  trainingSessionOptions,
  isDisableDelivery,
}: ApplicationDetailProps): FormFieldType<AdminApplicationDetails>[] => [
  {
    name: 'programId',
    type: 'combobox',
    label: 'Select program',
    className: 'col-span-2',
    noResults: 'No matching program',
    comboboxOptions: programOptions,
    handleSelect: (selectedValue, value) => {
      if (selectedValue === value) {
        return value;
      } else {
        return selectedValue;
      }
    },
    comboboxTrigger: (value) => {
      if (value) {
        return programOptions.find(
          ({ value: programValue }) => value === programValue,
        )?.optionLabel;
      } else {
        return 'Select a program';
      }
    },
  },
  {
    name: 'trainingSessionId',
    type: 'select',
    label: 'Select training session',
    selectLabel: 'Upcoming training sessions',
    placeholder: 'Training session',
    disabled,
    className: 'col-span-2',
    options: trainingSessionOptions,
  },
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
