import { deliveryModeOptions, venueOptions } from '@/helpers/enum.helpers';
import { FormFieldType } from '@/types/form-field.types';
import { NewTrainingSessionForm } from '@/validation/training-session/training-session.validation';
import { Delivery } from '@prisma/client';

type SessionFieldsArgs = {
  usingDifferentFees: boolean;
  usingUsd: boolean;
  mode?: Delivery;
};

const expandFieldsOnPremise = (mode?: Delivery) =>
  mode === Delivery.ON_PREMISE ? 'col-span-2' : undefined;
const expandFieldsOnline = (mode?: Delivery) =>
  mode === Delivery.ONLINE ? 'col-span-2' : undefined;

const kshFeesFields = (
  usingDifferentFees: boolean,
  mode?: Delivery,
): FormFieldType<NewTrainingSessionForm>[] => [
  ...(mode !== Delivery.ONLINE
    ? ([
        {
          name: 'citizenFee',
          label: 'Citizen: On premise fee',
          placeholder: 'eg. Ksh 100000',
          type: 'number',
          className: expandFieldsOnPremise(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ON_PREMISE
    ? ([
        {
          name: 'citizenOnlineFee',
          label: 'Citizen: online fee',
          placeholder: 'eg. Ksh 100000',
          type: 'number',
          className: expandFieldsOnline(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ONLINE && usingDifferentFees
    ? ([
        {
          name: 'eastAfricaFee',
          label: 'East Africa: On premise fee',
          placeholder: 'eg. Ksh 100000',
          type: 'number',
          className: expandFieldsOnPremise(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ON_PREMISE && usingDifferentFees
    ? ([
        {
          name: 'eastAfricaOnlineFee',
          label: 'East Africa: Online fee',
          placeholder: 'eg. Ksh 100000',
          type: 'number',
          className: expandFieldsOnline(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ONLINE && usingDifferentFees
    ? ([
        {
          name: 'globalParticipantFee',
          label: 'Global: On premise fee',
          placeholder: 'eg. Ksh 100000',
          type: 'number',
          className: expandFieldsOnPremise(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ON_PREMISE && usingDifferentFees
    ? ([
        {
          name: 'globalParticipantOnlineFee',
          label: 'Global: Online fee',
          placeholder: 'eg. Ksh 100000',
          type: 'number',
          className: expandFieldsOnline(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
];

const usdFeesFields = (
  usingDifferentFees: boolean,
  mode?: Delivery,
): FormFieldType<NewTrainingSessionForm>[] => [
  ...(mode !== Delivery.ONLINE
    ? ([
        {
          name: 'usdCitizenFee',
          label: 'Citizen: On premise fee',
          placeholder: 'eg. USD 1000',
          type: 'number',
          className: expandFieldsOnPremise(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ON_PREMISE
    ? ([
        {
          name: 'usdCitizenOnlineFee',
          label: 'Citizen: online fee',
          placeholder: 'eg. USD 1000',
          type: 'number',
          className: expandFieldsOnline(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ONLINE && usingDifferentFees
    ? ([
        {
          name: 'usdEastAfricaFee',
          label: 'East Africa: On premise fee',
          placeholder: 'eg. USD 1000',
          type: 'number',
          className: expandFieldsOnPremise(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ON_PREMISE && usingDifferentFees
    ? ([
        {
          name: 'usdEastAfricaOnlineFee',
          label: 'East Africa: Online fee',
          placeholder: 'eg. USD 1000',
          type: 'number',
          className: expandFieldsOnline(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ONLINE && usingDifferentFees
    ? ([
        {
          name: 'usdGlobalParticipantFee',
          label: 'Global: On premise fee',
          placeholder: 'eg. USD 1000',
          type: 'number',
          className: expandFieldsOnPremise(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
  ...(mode !== Delivery.ON_PREMISE && usingDifferentFees
    ? ([
        {
          name: 'usdGlobalParticipantOnlineFee',
          label: 'Global: Online fee',
          placeholder: 'eg. USD 1000',
          type: 'number',
          className: expandFieldsOnline(mode),
        },
      ] as FormFieldType<NewTrainingSessionForm>[])
    : []),
];

const sessionFields = ({
  usingDifferentFees,
  usingUsd,
  mode,
}: SessionFieldsArgs): FormFieldType<NewTrainingSessionForm>[] => {
  return [
    {
      name: 'startDate',
      label: 'Session Start Date',
      placeholder: '1/24/2024',
      type: 'date',
    },
    {
      name: 'endDate',
      label: 'Session End Date',
      placeholder: '1/24/2024',
      type: 'date',
    },
    {
      name: 'mode',
      label: 'Select the mode of delivery',
      placeholder: 'Select delivery mode',
      selectLabel: 'Delivery modes',
      type: 'select',
      options: deliveryModeOptions,
      className: mode ? expandFieldsOnline(mode) : 'col-span-2',
    },
    ...(mode && mode !== Delivery.ONLINE
      ? ([
          {
            name: 'venue',
            label: 'Session Venue',
            placeholder: 'Enter session venue',
            type: 'select',
            selectLabel: 'Available venues',
            options: venueOptions,
          },
        ] as FormFieldType<NewTrainingSessionForm>[])
      : []),
    {
      name: 'usingDifferentFees',
      type: 'switch',
      label: 'Enable different fees by citizenship',
      description:
        'This displays different fees fields for different citizenship types.',
      className: 'col-span-2 bg-background',
    },
    {
      name: 'usingUsd',
      type: 'switch',
      label: 'Enable USD($) payments',
      description:
        'This enables payments for this session to be collected in USD',
      className: 'col-span-2 bg-background',
    },
    ...(mode && mode !== Delivery.ONLINE
      ? ([
          {
            name: 'onPremiseSlots',
            label: 'On premise slots',
            placeholder: 'eg. 50',
            type: 'number',
            className: expandFieldsOnPremise(mode),
          },
        ] as FormFieldType<NewTrainingSessionForm>[])
      : []),
    ...(mode && mode !== Delivery.ON_PREMISE
      ? ([
          {
            name: 'onlineSlots',
            label: 'Online slots',
            placeholder: 'eg. 50',
            type: 'number',
            className: expandFieldsOnline(mode),
          },
        ] as FormFieldType<NewTrainingSessionForm>[])
      : []),
    ...(usingUsd || !mode ? [] : kshFeesFields(usingDifferentFees, mode)),
  ];
};

export { sessionFields, kshFeesFields, usdFeesFields };
