'use client';
import {
  DynamicTrainingOption,
  fetchProgramTrainingSessions,
} from '@/actions/training-session/application.training-session.actions';
import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import { Form } from '@/components/ui/form';
import { SelectOptions } from '@/types/form-field.types';
import {
  AdminApplicationForm,
  adminApplicationSchema,
} from '@/validation/applications/admin.application.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import applicationDetailsFields from './fields/application-details-fields';
import { format } from 'date-fns';
import { Delivery, SponsorType } from '@prisma/client';
import { cn } from '@/lib/utils';
import applicationOrganizationFields from './fields/application-organization-fields';
import slotsFields from './fields/application-slots-fields';
import {
  DynamicParticipantOption,
  fetchOrganizationParticipants,
} from '@/actions/participants/application.participants.actions';
import ApplicationParticipantsOrganization from './participants/participants-dropdown/application-participants-organization';
import TooltipIconButton from '@/components/buttons/tooltip-icon-button';
import { PlusIcon } from 'lucide-react';
import {
  AdminApplicationParticipant,
  ParticipantSubmitOption,
  applicationParticipantSchema,
} from '@/validation/applications/participants.application.validation';
import ApplicationParticipantForm from './participants/participants-form/application-participant-form';
import ParticipantApplicationsTable from './participants/participants-table/participants-application-table';
import tableSelectColumn from '@/components/table/table-select-column';
import { ColumnDef } from '@tanstack/react-table';
import participantApplicationColumnUser from './participants/participants-table/participant-application-user';
import participantApplicationActions from './participants/participants-table/participant-application-actions';
import participantApplicationEmail from './participants/participants-table/participant-application-email';
import participantApplicationCitizenship from './participants/participants-table/participant-application-citizenship';
import participantApplicationOwnerColumn from './participants/participants-table/participant-application-ower';
import participantApplicationNationalId from './participants/participants-table/participant-application-nationalid';
import participantApplicationRegistration from './participants/participants-table/participant-application-registration';
import ParticipantApplicationSheet from './participants/participants-sheet/participant-application-sheet';
import {
  SingleApplicationParticipant,
  getSingleParticipant,
} from '@/actions/participants/single.participant.actions';
import SubmitButton from '@/components/form/SubmitButton';
import {
  ValidAdminApplication,
  validateAdminApplication,
} from '@/actions/applications/admin/validate.admin.applications.actions';
import ApplicationModal from './modal/application-modal';

type NewApplicationFormProps = React.ComponentPropsWithoutRef<'form'> & {
  programOptions: SelectOptions[];
  organizationOptions: SelectOptions[];
};

const NewApplicationForm = ({
  programOptions,
  organizationOptions,
  className,
  ...props
}: NewApplicationFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [trainingSessionOptions, setTrainingSessionOptions] = useState<
    DynamicTrainingOption[]
  >([]);
  const [isDisableDelivery, setDisableDelivery] = useState<boolean>(true);
  const [participantOptions, setParticipantOptions] = useState<
    DynamicParticipantOption[]
  >([]);
  const [formComponents, setFormComponents] = useState<
    | DynamicParticipantOption
    | SingleApplicationParticipant
    | ValidAdminApplication
    | boolean
  >(false);

  const form = useForm<AdminApplicationForm>({
    resolver: zodResolver(adminApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      isExistingOrganization: false,
    },
  });

  const { handleSubmit, watch, setValue, reset, control, getValues } = form;
  console.log('Form errors: ', adminApplicationSchema.safeParse(watch()));

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'programId') {
        const programId = value.programId || '';
        if (programId !== '') {
          startTransition(() => {
            fetchProgramTrainingSessions(programId).then((data) => {
              if ('error' in data) {
                toast.error(data.error);
                return;
              } else {
                setTrainingSessionOptions(data.trainingOptions);
                setValue('trainingSessionId', '');
              }
            });
          });
        }
      }

      if (name === 'trainingSessionId') {
        const selectedTrainingSession = trainingSessionOptions.find(
          ({ id }) => id === value.trainingSessionId,
        );
        if (!selectedTrainingSession) {
          setDisableDelivery(true);
          setValue('delivery', Delivery.ONLINE);
          return;
        }
        if (selectedTrainingSession) {
          const { mode: selectedTrainingMode } = selectedTrainingSession;
          setDisableDelivery(selectedTrainingMode !== Delivery.BOTH_MODES);
          setValue(
            'delivery',
            selectedTrainingMode === Delivery.BOTH_MODES
              ? Delivery.ON_PREMISE
              : selectedTrainingMode,
          );
        }
      }

      if (name === 'organizationId' || name === 'trainingSessionId') {
        const organizationId = value.organizationId || '';
        const trainingSessionId = value.trainingSessionId || '';

        const shouldFetchParticipants = [
          value.sponsorType === SponsorType.ORGANIZATION,
          value.isExistingOrganization === true,
          value.trainingSessionId,
          value.organizationId,
        ].every(Boolean);

        if (!shouldFetchParticipants) return;

        startTransition(() => {
          fetchOrganizationParticipants({
            organizationId,
            trainingSessionId,
          }).then((data) => {
            if ('error' in data) {
              toast.error(data.error);
            } else {
              setParticipantOptions(data.participantOptions);
              reset({
                ...value,
                participants: undefined,
                slotsCitizen: undefined,
                slotsEastAfrican: undefined,
                slotsGlobal: undefined,
              });
            }
          });
        });
      }

      if (name === 'isExistingOrganization' || name === 'sponsorType') {
        reset({
          ...value,
          ...(name === 'sponsorType' ? { isExistingOrganization: false } : {}),
          participants: undefined,
          organizationId: undefined,
          name: undefined,
          county: undefined,
          organizationEmail: undefined,
          organizationPhone: undefined,
          organizationAddress: undefined,
          contactPersonName: undefined,
          contactPersonEmail: undefined,
        });
        setParticipantOptions((prev) => []);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trainingSessionOptions, reset, setValue]);

  const applicationDetailsForm = applicationDetailsFields({
    disabled: isPending,
    programOptions,
    trainingSessionOptions: trainingSessionOptions.map(
      ({ id, startDate, endDate }) => ({
        value: id,
        optionLabel: `${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`,
      }),
    ),
    isDisableDelivery,
  });

  const applicationOrganizationForm = applicationOrganizationFields({
    existingOrganization: watch('isExistingOrganization'),
    organizationOptions,
  });

  const { append, remove } = useFieldArray({
    name: 'participants',
    control,
    rules: {
      minLength: { value: 1, message: 'At least one participant required' },
    },
  });

  const handleSelectParticipant = (participant: DynamicParticipantOption) => {
    const validParticipant =
      applicationParticipantSchema.safeParse(participant);
    if (!validParticipant.success) {
      toast.error('Complete the participant form to add this participant');
      setFormComponents((prev) => participant);
    }
  };

  const selectedParticipantIds: string[] = participantOptions
    .filter(({ id }) =>
      getValues(`participants`)
        ?.map(({ userId }) => userId)
        .includes(id),
    )
    .map(({ id }) => id);

  const participantSubmit: SubmitHandler<AdminApplicationParticipant> = (
    values,
  ) => {
    append(values);
    setFormComponents((prev) => false);
    toast.success(`${values.name} added as a participant`);
  };

  const viewParticipant = (participantId: string) => {
    startTransition(() => {
      getSingleParticipant(participantId).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          setFormComponents((prev) => data.participant);
        }
      });
    });
  };

  const removeParticipant = (email: string) => {
    const index = getValues('participants')?.findIndex(
      (participant) => participant.email === email,
    );
    if (index && index !== -1) {
      const removedParticipantName = getValues(`participants.${index}.name`);
      remove(index);
      toast.success(`${removedParticipantName} removed successfully`);
    } else {
      toast.error('Participant not found');
    }
  };

  const removeManyParticipants = (emails: string[]) => {
    const currentParticipants = getValues('participants');
    const updatedParticipants = currentParticipants?.filter(
      ({ email }) => !emails.includes(email),
    );
    setValue('participants', updatedParticipants);
    toast.success(`${emails.length} participants removed`);
  };

  const toggleOwner = (email: string) => {
    const participants = getValues('participants');
    const owner = participants?.find(
      ({ email: participantEmail, isOwner }) =>
        participantEmail === email && isOwner,
    );
    if (!!!owner && !!participants) {
      const updatedParticipants = participants.map((participant) => ({
        ...participant,
        isOwner: participant.email === email,
      }));
      const newOwnerName = updatedParticipants.filter(
        ({ isOwner }) => isOwner,
      )[0].name;
      setValue('participants', updatedParticipants);
      toast.success(`${newOwnerName} set as primary contact`);
    }
  };

  const participantColumns: ColumnDef<ParticipantSubmitOption>[] = [
    tableSelectColumn<ParticipantSubmitOption>(isPending),
    participantApplicationColumnUser,
    participantApplicationRegistration,
    participantApplicationActions({
      isPending,
      viewParticipant,
      removeParticipant,
    }),
    participantApplicationEmail,
    participantApplicationOwnerColumn({
      isPending,
      toggleOwner,
    }),
    participantApplicationCitizenship,
    participantApplicationNationalId,
  ];

  const showForm =
    formComponents === true ||
    (typeof formComponents === 'object' && '_count' in formComponents);
  const showSheet =
    typeof formComponents === 'object' && 'applications' in formComponents;
  const showDialog =
    typeof formComponents === 'object' &&
    'applicationTrainingSession' in formComponents;

  const closeInfo = () => setFormComponents((prev) => false);

  const onSubmit: SubmitHandler<AdminApplicationForm> = (values) => {
    startTransition(() => {
      validateAdminApplication(values).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          setFormComponents((prev) => data);
        }
      });
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            'grid w-3/5 grid-cols-2 justify-center gap-x-4 gap-y-2',
            className,
          )}
          {...props}
        >
          <FormHeader
            label="1. Application details"
            description="Options may vary based on the selection for the program and training session"
            className="col-span-2"
          />
          <ReusableForm formFields={applicationDetailsForm} />
          {watch('sponsorType') === SponsorType.ORGANIZATION && (
            <>
              <FormHeader
                label="2. Organization details"
                description="Select an existing organization or create a new one"
                className="col-span-2"
              />
              <ReusableForm formFields={applicationOrganizationForm} />
            </>
          )}
          <FormHeader
            label={`${watch('sponsorType') === SponsorType.ORGANIZATION ? '3.' : '2.'} Participant details`}
            description="Select existing user and/or set the slots"
            className="col-span-2"
          />
          {!!getValues('participants')?.length && (
            <ParticipantApplicationsTable
              participants={getValues('participants')!}
              columns={participantColumns}
              removeManyParticipants={removeManyParticipants}
            />
          )}
          {showForm && (
            <ApplicationParticipantForm
              participant={
                typeof formComponents === 'object' ? formComponents : undefined
              }
              isSubmitting={isPending}
              customSubmit={participantSubmit}
              dismissForm={closeInfo}
              className="mb-4 col-span-2"
            />
          )}
          <p className="text-sm font-medium text-black">Add participant info</p>
          <div className="flex mb-8 col-span-2 space-x-2">
            <TooltipIconButton
              icon={<PlusIcon />}
              type="button"
              tooltipLabel="Add new participant"
              className="bg-green-600/80 hover:bg-green-600"
              onClick={() => setFormComponents((prev) => true)}
            />
            <ApplicationParticipantsOrganization
              onItemSelect={handleSelectParticipant}
              participantOptions={participantOptions}
              selectedParticipantIds={selectedParticipantIds}
              disabled={isPending}
              className="flex flex-grow"
            />
          </div>
          <div className="flex justify-between w-full mb-8 col-span-2 space-x-3">
            <ReusableForm formFields={slotsFields} />
          </div>
          <SubmitButton
            label="Submit application"
            isSubmitting={isPending}
            className="w-full my-4"
          />
        </form>
      </Form>
      {showSheet && (
        <ParticipantApplicationSheet
          open={showSheet}
          participant={formComponents as SingleApplicationParticipant}
          onOpenChange={closeInfo}
        />
      )}
      {showDialog && (
        <ApplicationModal
          open={showDialog}
          validAdminApplication={formComponents as ValidAdminApplication}
          onOpenChange={closeInfo}
        />
      )}
    </>
  );
};

export default NewApplicationForm;
