'use client';
import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  TrainingSessionFeesForm,
  trainingSessionFeesSchema,
} from '@/validation/training-session/training-session.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Delivery } from '@prisma/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ApplicationModalProps } from './application-modal-steps';

type FeesTypesSettings = {
  isOnpremise: boolean;
  isUsd: boolean;
};

type FeeDataFields = ApplicationModalProps['formSlots'] & FeesTypesSettings;

const feesFields = ({
  slotsCitizen,
  slotsEastAfrican,
  slotsGlobal,
  isOnpremise,
  isUsd,
}: FeeDataFields): FormFieldType<TrainingSessionFeesForm>[] => {
  return [
    {
      name: 'usingUsd',
      type: 'switch',
      label: 'Enable USD($) payments',
      description:
        'This enables payments for this application to be collected in USD',
      className: 'col-span-2 bg-background',
    },
    ...(!isUsd && isOnpremise && slotsCitizen
      ? ([
          {
            name: 'citizenFee',
            label: 'Citizen(Kes): On premise fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(!isUsd && !isOnpremise && slotsCitizen
      ? ([
          {
            name: 'citizenOnlineFee',
            label: 'Citizen(Kes): online fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(!isUsd && isOnpremise && slotsEastAfrican
      ? ([
          {
            name: 'eastAfricaFee',
            label: 'East Africa(Kes): On premise fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(!isUsd && !isOnpremise && slotsEastAfrican
      ? ([
          {
            name: 'eastAfricaOnlineFee',
            label: 'East Africa(Kes): Online fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(!isUsd && isOnpremise && slotsGlobal
      ? ([
          {
            name: 'globalParticipantFee',
            label: 'Global(Kes): On premise fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(!isUsd && !isOnpremise && slotsGlobal
      ? ([
          {
            name: 'globalParticipantOnlineFee',
            label: 'Global(Kes): Online fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(isUsd && isOnpremise && slotsCitizen
      ? ([
          {
            name: 'usdCitizenFee',
            label: 'Citizen(Usd): On premise fee',
            placeholder: 'eg. USD 1000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(isUsd && !isOnpremise && slotsCitizen
      ? ([
          {
            name: 'usdCitizenOnlineFee',
            label: 'Citizen(Usd): online fee',
            placeholder: 'eg. USD 1000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(isUsd && isOnpremise && slotsEastAfrican
      ? ([
          {
            name: 'usdEastAfricaFee',
            label: 'East Africa(Usd): On premise fee',
            placeholder: 'eg. USD 1000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(isUsd && !isOnpremise && slotsEastAfrican
      ? ([
          {
            name: 'usdEastAfricaOnlineFee',
            label: 'East Africa(Usd): Online fee',
            placeholder: 'eg. USD 1000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(isUsd && isOnpremise && slotsGlobal
      ? ([
          {
            name: 'usdGlobalParticipantFee',
            label: 'Global(Usd): On premise fee',
            placeholder: 'eg. USD 1000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
    ...(isUsd && !isOnpremise && slotsGlobal
      ? ([
          {
            name: 'usdGlobalParticipantOnlineFee',
            label: 'Global(Usd): Online fee',
            placeholder: 'eg. USD 1000',
            type: 'number',
          },
        ] as FormFieldType<TrainingSessionFeesForm>[])
      : []),
  ];
};

type ApplicationConfirmationFeesProps = Pick<
  ApplicationModalProps,
  | 'data'
  | 'applicationTrainingSession'
  | 'formSlots'
  | 'handleFees'
  | 'usingUsd'
>;

const ApplicationConfirmationFees = ({
  data,
  applicationTrainingSession,
  formSlots,
  usingUsd,
  handleFees,
}: ApplicationConfirmationFeesProps) => {
  const { slotsCitizen, slotsEastAfrican, slotsGlobal } = formSlots;
  const { delivery } = data;

  const validFees = Object.fromEntries(
    Object.entries(applicationTrainingSession).filter(
      ([_, value]) => value !== null,
    ),
  );

  const isOnpremise = delivery !== Delivery.ONLINE;
  const fees = trainingSessionFeesSchema.parse(validFees);

  const form = useForm<TrainingSessionFeesForm>({
    resolver: zodResolver(trainingSessionFeesSchema),
    defaultValues: {
      ...fees,
      usingUsd,
    },
    mode: 'onChange',
  });

  const { watch } = form;

  const isUsd = watch('usingUsd');

  const setFormApplicationFees = ({
    isUsd,
    isOnpremise,
  }: FeesTypesSettings): number | undefined => {
    if (isOnpremise && !isUsd) {
      if (slotsCitizen && !watch('citizenFee')) return undefined;
      if (slotsEastAfrican && !watch('eastAfricaFee')) return undefined;
      if (slotsGlobal && !watch('globalParticipantFee')) return undefined;
      return (
        (slotsCitizen || 0) * (watch('citizenFee') || 0) +
        (slotsEastAfrican || 0) * (watch('eastAfricaFee') || 0) +
        (slotsGlobal || 0) * (watch('globalParticipantFee') || 0)
      );
    } else if (!isOnpremise && !isUsd) {
      if (slotsCitizen && !watch('citizenOnlineFee')) return undefined;
      if (slotsEastAfrican && !watch('eastAfricaOnlineFee')) return undefined;
      if (slotsGlobal && !watch('globalParticipantOnlineFee')) return undefined;
      return (
        (slotsCitizen || 0) * (watch('citizenOnlineFee') || 0) +
        (slotsEastAfrican || 0) * (watch('eastAfricaOnlineFee') || 0) +
        (slotsGlobal || 0) * (watch('globalParticipantOnlineFee') || 0)
      );
    } else if (isOnpremise && isUsd) {
      if (slotsCitizen && !watch('usdCitizenFee')) return undefined;
      if (slotsEastAfrican && !watch('usdEastAfricaFee')) return undefined;
      if (slotsGlobal && !watch('usdGlobalParticipantFee')) return undefined;
      return (
        (slotsCitizen || 0) * (watch('usdCitizenFee') || 0) +
        (slotsEastAfrican || 0) * (watch('usdEastAfricaFee') || 0) +
        (slotsGlobal || 0) * (watch('usdGlobalParticipantFee') || 0)
      );
    } else if (!isOnpremise && isUsd) {
      if (slotsCitizen && !watch('usdCitizenOnlineFee')) return undefined;
      if (slotsEastAfrican && !watch('usdEastAfricaOnlineFee'))
        return undefined;
      if (slotsGlobal && !watch('usdGlobalParticipantOnlineFee'))
        return undefined;
      return (
        (slotsCitizen || 0) * (watch('usdCitizenOnlineFee') || 0) +
        (slotsEastAfrican || 0) * (watch('usdEastAfricaOnlineFee') || 0) +
        (slotsGlobal || 0) * (watch('usdGlobalParticipantOnlineFee') || 0)
      );
    }
  };

  const formApplicationFees = setFormApplicationFees({
    isUsd,
    isOnpremise,
  });

  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type === 'change') {
        handleFees({});
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleFees]);

  return (
    <Form {...form}>
      <div className="w-full grid grid-cols-2 gap-x-2 gap-y-4">
        <ReusableForm
          formFields={feesFields({
            ...formSlots,
            isOnpremise,
            isUsd,
          })}
        />
        {!!formApplicationFees && (
          <div className="flex flex-col col-span-2 ">
            <Separator className="my-6" />
            <div className="flex items-center justify-center w-full gap-x-2">
              <p className="font-medium">Total Application Fee:</p>{' '}
              <p className="font-medium text-red-600">{`${watch('usingUsd') ? 'USD' : 'KES'} ${formApplicationFees.toLocaleString('en-US')}`}</p>
            </div>
          </div>
        )}
        <Button
          variant="default"
          className={cn('col-span-2 bg-green-600 mt-2')}
          disabled={!formApplicationFees}
          onClick={() => handleFees({ fee: formApplicationFees, usingUsd })}
        >
          Confirm Application Fees
        </Button>
      </div>
    </Form>
  );
};

export default ApplicationConfirmationFees;
