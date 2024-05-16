'use client';
import ReusableForm from '@/components/form/ReusableForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  TrainingSessionFeesForm,
  trainingSessionFeesSchema,
} from '@/validation/training-session/training-session.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Delivery, UserRole } from '@prisma/client';
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
  isAdmin,
}: FeeDataFields & {
  isAdmin: boolean;
}): FormFieldType<TrainingSessionFeesForm>[] => {
  return [
    {
      name: 'usingUsd',
      type: 'switch',
      label: isAdmin ? 'Enable USD($) Payment' : 'Pay in USD($)',
      description: isAdmin
        ? 'This enables payments for this application to be collected in USD'
        : 'Your invoice will be prepared in USD',
      className: 'col-span-2 bg-background',
    },
    ...(!isUsd && isOnpremise && slotsCitizen
      ? ([
          {
            name: 'citizenFee',
            label: 'Citizen(Kes): On premise fee',
            placeholder: 'eg. Ksh 100000',
            type: 'number',
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
            disabled: !isAdmin,
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
  | 'usingUsd'
  | 'role'
  | 'applicationFee'
> & {
  handleFees: ({ fee, usingUsd }: { fee?: number; usingUsd?: boolean }) => void;
};

const ApplicationConfirmationFees = ({
  data,
  applicationTrainingSession,
  formSlots,
  usingUsd,
  handleFees,
  role,
  applicationFee,
}: ApplicationConfirmationFeesProps) => {
  const isAdmin = role === UserRole.ADMIN;
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

  const isConfirmedFees =
    applicationFee === formApplicationFees && usingUsd === isUsd;

  const showFeesWarning = (): boolean => {
    if (isAdmin) {
      return false;
    } else if (isUsd && delivery === Delivery.ONLINE) {
      return (
        (!applicationTrainingSession.usdCitizenOnlineFee && !!slotsCitizen) ||
        (!applicationTrainingSession.usdEastAfricaOnlineFee &&
          !!slotsEastAfrican) ||
        (!applicationTrainingSession.usdGlobalParticipantOnlineFee &&
          !!slotsGlobal)
      );
    } else if (isUsd && delivery !== Delivery.ONLINE) {
      return (
        (!applicationTrainingSession.usdCitizenFee && !!slotsCitizen) ||
        (!applicationTrainingSession.usdEastAfricaFee && !!slotsEastAfrican) ||
        (!applicationTrainingSession.usdGlobalParticipantFee && !!slotsGlobal)
      );
    } else if (!isUsd && delivery === Delivery.ONLINE) {
      return (
        (!applicationTrainingSession.citizenOnlineFee && !!slotsCitizen) ||
        (!applicationTrainingSession.eastAfricaOnlineFee &&
          !!slotsEastAfrican) ||
        (!applicationTrainingSession.globalParticipantOnlineFee &&
          !!slotsGlobal)
      );
    } else {
      return (
        (!applicationTrainingSession.citizenFee && !!slotsCitizen) ||
        (!applicationTrainingSession.eastAfricaFee && !!slotsEastAfrican) ||
        (!applicationTrainingSession.globalParticipantFee && !!slotsGlobal)
      );
    }
  };

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
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-4">
        <ReusableForm
          formFields={feesFields({
            ...formSlots,
            isOnpremise,
            isUsd,
            isAdmin,
          })}
        />
        <div className="flex flex-col col-span-2 ">
          <Separator className="my-6" />
          {!!formApplicationFees && (
            <div className="flex items-start w-full gap-x-2">
              <p className="font-medium">Total Application Fee:</p>{' '}
              <p className="font-medium text-red-600">{`${watch('usingUsd') ? 'USD' : 'KES'} ${formApplicationFees.toLocaleString('en-US')}`}</p>
            </div>
          )}
          <div
            className={cn(
              'flex col-span-2 space-x-2 items-top',
              !!formApplicationFees && 'mt-4',
            )}
          >
            <Checkbox
              id="confirmation"
              checked={isConfirmedFees}
              onCheckedChange={() =>
                handleFees({ fee: formApplicationFees, usingUsd: isUsd })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="confirmation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {`Confirm application ${!!formApplicationFees || isAdmin ? 'fees' : 'payment currency'}`}
              </Label>
              {showFeesWarning() && (
                <p className="text-sm text-red-600">
                  {`For ${isUsd ? 'USD' : 'KES'} some fees have not been added. However, if you continue with the application, the admin will add the fees on approval`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default ApplicationConfirmationFees;
