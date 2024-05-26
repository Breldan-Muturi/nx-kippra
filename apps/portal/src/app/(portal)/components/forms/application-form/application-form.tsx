'use client';
import { TrainingSessionInfo } from '@/actions/applications/form.applications.actions';
import {
  ValidAdminApplication,
  validateAdminApplication,
} from '@/actions/applications/validate.applications.actions';
import { OrgOption } from '@/actions/organization/org.options.actions';
import {
  DynamicParticipantOption,
  fetchOrganizationParticipants,
} from '@/actions/participants/application.participants.actions';
import {
  SingleApplicationParticipant,
  getSingleParticipant,
} from '@/actions/participants/single.participant.actions';
import { ProgramsOption } from '@/actions/programmes/programs.options.actions';
import {
  DynamicTrainingOption,
  fetchProgramTrainingSessions,
} from '@/actions/training-session/application.training-session.actions';
import TooltipIconButton from '@/components/buttons/tooltip-icon-button';
import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { useCurrentRole } from '@/hooks/use-current-role';
import { cn } from '@/lib/utils';
import {
  AdminApplicationForm,
  adminApplicationSchema,
} from '@/validation/applications/admin.application.validation';
import {
  FormApplicationParticipant,
  applicationParticipantSchema,
} from '@/validation/applications/participants.application.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Delivery, SponsorType, UserRole } from '@prisma/client';
import { format } from 'date-fns';
import { PlusIcon } from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import applicationDetailsFields from './fields/application-details-fields';
import applicationOrganizationFields from './fields/application-organization-fields';
import slotsFields from './fields/application-slots-fields';
import ApplicationModal from './modal/application-modal';
import ApplicationParticipantsOrganization from './participants/participants-dropdown/application-participants-organization';
import ApplicationParticipantForm from './participants/participants-form/application-participant-form';
import ParticipantApplicationSheet from './participants/participants-sheet/participant-application-sheet';
import ParticipantApplicationsTable from './participants/participants-table/participants-application-table';

type ApplicationFormProps = React.ComponentPropsWithoutRef<'form'> & {
  trainingSessionInfo?: TrainingSessionInfo;
  programOptions?: ProgramsOption[];
  orgOptions: OrgOption[];
};

const ApplicationForm = ({
  trainingSessionInfo,
  programOptions,
  orgOptions,
  className,
  ...props
}: ApplicationFormProps) => {
  const isAdmin = useCurrentRole() === UserRole.ADMIN;
  const [isPending, startTransition] = useTransition();
  const [trainingSessionOptions, setTrainingSessionOptions] = useState<
    DynamicTrainingOption[]
  >([]);
  const [isDisableDelivery, setDisableDelivery] = useState<boolean>(
    !!trainingSessionInfo
      ? trainingSessionInfo.mode !== Delivery.BOTH_MODES
      : true,
  );
  const [participantOptions, setParticipantOptions] = useState<
    DynamicParticipantOption[]
  >([]);
  const [formComponents, setFormComponents] = useState<
    | DynamicParticipantOption
    | SingleApplicationParticipant
    | ValidAdminApplication
    | boolean
  >(false);

  const deliveryDefault: Delivery | undefined = trainingSessionInfo
    ? trainingSessionInfo.mode === Delivery.BOTH_MODES
      ? Delivery.ON_PREMISE
      : trainingSessionInfo.mode
    : undefined;

  const form = useForm<AdminApplicationForm>({
    resolver: zodResolver(adminApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      trainingSessionId: trainingSessionInfo?.id,
      programId: trainingSessionInfo?.program.id,
      delivery: deliveryDefault,
      isExistingOrganization: false,
    },
  });

  const { handleSubmit, watch, setValue, reset, control, getValues, setError } =
    form;

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
    orgOptions,
  });

  const { append } = useFieldArray({
    name: 'participants',
    control,
  });
  const updatesOwner =
    !!!getValues('participants')?.find(({ isOwner }) => isOwner) && isAdmin;

  const handleSelectParticipant = (participant: DynamicParticipantOption) => {
    const validParticipant = applicationParticipantSchema.safeParse({
      ...participant,
      userId: participant.id,
      isOwner: updatesOwner,
    });
    if (!validParticipant.success) {
      toast.error('Complete the participant form to add this participant');
      setFormComponents((prev) => participant);
    } else {
      append(validParticipant.data);
      toast.success(`${validParticipant.data.name} added as a participant`);
    }
  };

  const selectedParticipantIds: string[] = participantOptions
    .filter(({ id }) =>
      getValues(`participants`)
        ?.map(({ userId }) => userId)
        .includes(id),
    )
    .map(({ id }) => id);

  const participantSubmit: SubmitHandler<FormApplicationParticipant> = (
    values,
  ) => {
    append({ ...values, isOwner: updatesOwner });
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

  const removeManyParticipants = (emails: string[]) => {
    const currentParticipants = getValues('participants');
    const updatedParticipants = currentParticipants?.filter(
      ({ email }) => !emails.includes(email),
    );
    const removedOwner = currentParticipants?.find(
      ({ isOwner, email }) => !!isOwner && emails.includes(email),
    );
    if (
      removedOwner &&
      updatedParticipants &&
      updatedParticipants.length > 0 &&
      updatesOwner
    ) {
      updatedParticipants[0].isOwner = true;
    }
    setValue('participants', updatedParticipants);
    toast.success(
      `${emails.length} participant${emails.length === 1 ? '' : 's'} removed successfully`,
    );
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
          if (data.formErrors) {
            data.formErrors.map(({ field, message }) =>
              setError(field, {
                type: 'manual',
                message,
              }),
            );
          }
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
            'flex flex-col lg:grid w-full p-2 md:p-4 lg:p-0 lg:w-3/5 lg:grid-cols-2 justify-center gap-x-4 gap-y-2',
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
                className="col-span-2 my-2 lg:my-5"
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
              isPending={isPending}
              isAdmin={isAdmin}
              toggleOwner={toggleOwner}
              viewParticipant={viewParticipant}
              participants={getValues('participants')!}
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
              className="col-span-2 mb-4"
            />
          )}
          <p className="text-sm font-medium text-black">Add participant info</p>
          {/* <div className="flex col-span-2 mb-8 space-x-2"> */}
          <div className="flex mb-8 space-x-2 md:col-span-2">
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
          <div className="flex flex-col w-full col-span-2 mb-8 space-y-4 lg:justify-between lg:space-y-0 lg:space-x-3 lg:flex-row">
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

export default ApplicationForm;
