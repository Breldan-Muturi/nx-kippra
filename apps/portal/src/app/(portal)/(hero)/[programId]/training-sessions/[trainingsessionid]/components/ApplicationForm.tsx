"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { Form } from "@/components/ui/form";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import FormHeader from "@/components/form/FormHeader";
import { FormFieldType, SelectOptions } from "@/types/form-field.types";
import {
  NewApplicationForm,
  ParticipantSelectOption,
  ValidatedApplicationForm,
  newApplicationSchema,
} from "@/validation/application.validation";
import { Citizenship, Delivery, SponsorType } from "@prisma/client";
import { TrainingSessionApplicationData } from "@/helpers/training-session.helpers";
import ReusableForm from "@/components/form/ReusableForm";
import { zodResolver } from "@hookform/resolvers/zod";
import DialogFormConfirmation, {
  DialogFormConfirmationProps,
} from "@/components/form/DialogFormConfirmation";
import {
  applicationForm,
  organizationForm,
  slotsFields,
} from "./ApplicationFields";
import { format } from "date-fns";
import { toast } from "sonner";
import SubmitButton from "@/components/form/SubmitButton";
import { validateApplication } from "@/actions/applications/validate.application.actions";
import ApplicationConfirmationDialog from "./ApplicationConfirmationDialog";
import { formatDeliveryMode } from "@/helpers/enum.helpers";
import AddParticipant from "./AddParticipant";
import { PlusIcon, TrashIcon } from "lucide-react";
import ParticipantButton, { ParticipantButtonProps } from "./ParticipantButton";
import ExistingUsers from "./ExistingUsers";
import { cn } from "@/lib/utils";
import { userNewApplication } from "@/actions/applications/user/new.application.action";
import { useRouter } from "next/navigation";

interface ApplicationFormProps {
  trainingSessionData: TrainingSessionApplicationData;
  organizationOptions: SelectOptions[];
  participantSearchOptions: ParticipantSelectOption[];
}

const ApplicationForm = ({
  trainingSessionData,
  organizationOptions,
  participantSearchOptions,
}: ApplicationFormProps) => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [validApplication, setValidApplication] =
    useState<ValidatedApplicationForm | null>();
  const [isPending, startTransition] = useTransition();
  const sessionHasBothFields = trainingSessionData.mode === Delivery.BOTH_MODES;
  const dialogStart = format(trainingSessionData.startDate, "PPP");
  const dialogEnd = format(trainingSessionData.endDate, "PPP");

  const form = useForm<NewApplicationForm>({
    resolver: zodResolver(newApplicationSchema),
    mode: "onChange",
    defaultValues: {
      trainingSessionId: trainingSessionData.id,
      // Handle this differently
      citizenFee:
        trainingSessionData.citizenFee ||
        trainingSessionData.citizenOnlineFee ||
        undefined,
      eastAfricanFee:
        trainingSessionData.eastAfricaFee ||
        trainingSessionData.eastAfricaOnlineFee ||
        undefined,
      globalFee:
        trainingSessionData.globalParticipantFee ||
        trainingSessionData.globalParticipantOnlineFee ||
        undefined,
      isExistingOrganization: false,
      participants: [],
      newOrganization: null,
      organizationId: null,
      sponsorType: undefined,
      trainingSessionStartDate: trainingSessionData.startDate,
      trainingSessionEndDate: trainingSessionData.endDate,
      programTitle: trainingSessionData.program.title,
      delivery: sessionHasBothFields
        ? Delivery.ON_PREMISE
        : trainingSessionData.mode,
    },
  });

  const { handleSubmit, watch, getValues, reset, control, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    name: "participants",
    control,
    rules: { required: "At least one participant is required" },
  });

  const isExistingOrganization = watch("isExistingOrganization");
  const isOrganizationSponsored =
    watch("sponsorType") === SponsorType.ORGANIZATION;
  const modeSelected = formatDeliveryMode(
    watch("delivery") ?? trainingSessionData.mode,
  );
  const organizationFormFields = organizationForm(
    isExistingOrganization,
    organizationOptions,
  );

  // console.log(newApplicationSchema.safeParse(getValues()));

  const forms: {
    title: string;
    description?: string;
    form: FormFieldType<NewApplicationForm>[];
  }[] = [
    {
      title: "Application details",
      description: "Define your application information",
      form: applicationForm(sessionHasBothFields),
    },
    // Conditionally include the organization form
    ...(isOrganizationSponsored
      ? [
          {
            title: "Organization details",
            description: "Specify your sponsor information",
            form: organizationFormFields,
          },
        ]
      : []),
  ];
  const onSubmit: SubmitHandler<NewApplicationForm> = (data) => {
    startTransition(() => {
      validateApplication(data).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
          setOpen(true);
          setValidApplication(data.validatedApplication);
        }
      });
    });
  };

  const submitApplication = () => {
    if (validApplication) {
      userNewApplication(validApplication).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
          router.push(`/applications/?viewApplication=${data.applicationId}`);
        }
      });
    }
    setValidApplication(null);
    setOpen(false);
  };

  const submitDialog: DialogFormConfirmationProps = {
    open,
    setOpen,
    label: "Submit This Application",
    description: `Starting from ${dialogStart} to ${dialogEnd} delivered ${modeSelected}`,
    dialogContent: validApplication ? (
      <ApplicationConfirmationDialog {...validApplication} />
    ) : (
      "Kindly resubmit the form to confirm application details"
    ),
    onSubmit: submitApplication,
    submitLabel: "Submit this application",
    title: `Application for ${trainingSessionData?.program.title}`,
  };

  const appendFunction = () => {
    append({
      name: "",
      email: "",
      userId: "",
      nationalId: "",
      citizenship: Citizenship.KENYAN,
      organizationName: "",
      organizationId: "",
    });
  };

  const selectedExistingUserIds: string[] = participantSearchOptions
    .filter(
      ({ userId }) =>
        userId &&
        getValues(`participants`)
          ?.map(({ userId }) => userId)
          .includes(userId),
    )
    .map(({ userId }) => userId as string);

  const handleSelectedUser = useCallback(
    (value: string) => {
      const selectedParticipant = participantSearchOptions.find(
        ({ userId }) => userId === value,
      );
      if (selectedParticipant) {
        append({
          name: selectedParticipant.name ?? "",
          citizenship: selectedParticipant.citizenship ?? Citizenship.KENYAN,
          email: selectedParticipant.email ?? "",
          nationalId: selectedParticipant.nationalId ?? "",
          organizationName: selectedParticipant.organizationName ?? "",
          organizationId: selectedParticipant.organizationId,
          userId: selectedParticipant.userId,
        });
      }
    },
    [append, participantSearchOptions],
  );

  const kenyanParticipantCount = getValues(`participants`).filter(
    ({ citizenship }) => citizenship === Citizenship.KENYAN,
  ).length;
  const eastAfricanCount = getValues(`participants`).filter(
    ({ citizenship }) => citizenship === Citizenship.EAST_AFRICAN,
  ).length;
  const globalCount = getValues(`participants`).filter(
    ({ citizenship }) => citizenship === Citizenship.GLOBAL,
  ).length;

  // Reset the form based on the behaviour of other fields
  useEffect(() => {
    let needReset = false;
    const currentValues = getValues();

    if (!isOrganizationSponsored) {
      currentValues.newOrganization = null;
      currentValues.organizationId = null;
      currentValues.isExistingOrganization = false;
      needReset = true;
    }

    if (isExistingOrganization) {
      currentValues.newOrganization = null;
      needReset = true;
    }

    if (kenyanParticipantCount > (currentValues.slotsCitizen ?? 0)) {
      currentValues.slotsCitizen = kenyanParticipantCount;
      needReset = true;
    }

    if (eastAfricanCount > (currentValues.slotsEastAfrican ?? 0)) {
      currentValues.slotsEastAfrican = eastAfricanCount;
      needReset = true;
    }

    if (globalCount > (currentValues.slotsGlobal ?? 0)) {
      currentValues.slotsGlobal = globalCount;
      needReset = true;
    }

    // Log values after reset
    if (needReset) {
      reset(currentValues);
    }
  }, [
    isExistingOrganization,
    isOrganizationSponsored,
    kenyanParticipantCount,
    eastAfricanCount,
    globalCount,
    getValues,
    reset,
  ]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-3/5 grid-cols-2 items-end justify-center gap-x-4 gap-y-2"
        >
          {forms.map(({ title, description, form }, i) => (
            <React.Fragment key={`${i}-${title}`}>
              <FormHeader
                label={`${i + 1}. ${title}`}
                description={description}
                className="col-span-2 justify-start"
              />
              <ReusableForm formFields={form} />
            </React.Fragment>
          ))}

          <FormHeader
            label={`${forms.length + 1}. Participant details`}
            description="Add your application participants by reserving total slots, and adding available participant details"
            className="col-span-2 justify-start"
          />
          <div className="col-span-2 flex items-end justify-between space-x-2">
            <div className="flex-cols-3 flex w-1/3 flex-grow items-center gap-x-2">
              <ReusableForm
                formFields={slotsFields({
                  kenyanParticipantCount,
                  eastAfricanCount,
                  globalCount,
                })}
              />
            </div>
            {participantSearchOptions.length > 0 && (
              <ExistingUsers
                onItemSelect={handleSelectedUser}
                selectedUserIds={selectedExistingUserIds}
                participantDetails={participantSearchOptions}
                className="flex-grow"
              />
            )}
            <ParticipantButton
              icon={<PlusIcon />}
              tooltipLabel="Add new participant"
              onClick={appendFunction}
              className="bg-green-600/80 hover:bg-green-600"
            />
          </div>
          <div className="col-span-2 flex flex-col items-center justify-start space-y-2 divide-y-2 divide-gray-300">
            {fields.map((field, i) => {
              const isLast = fields.length - 1 === i;
              const badgeText = `Participant ${i + 1} of ${fields.length}`;
              const actionButtons: ParticipantButtonProps[] = [
                {
                  icon: <TrashIcon />,
                  tooltipLabel: "Remove participant",
                  onClick: () => remove(i),
                },
                {
                  isVisible: isLast,
                  icon: <PlusIcon />,
                  tooltipLabel: "Add new participant",
                  className: "bg-green-600/80 hover:bg-green-600",
                  onClick: appendFunction,
                },
              ];
              return (
                <div
                  key={field.id}
                  className={cn("flex w-full space-x-4 py-8", isLast && "pb-2")}
                >
                  <AddParticipant
                    index={i}
                    field={field}
                    organizationOptions={organizationOptions}
                    badgeText={badgeText}
                  />
                  <div className="flex flex-col items-center justify-end space-y-2">
                    {actionButtons.map((actionButton, i) => {
                      const key = `${i}${actionButton.tooltipLabel}`;
                      return <ParticipantButton key={key} {...actionButton} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <SubmitButton
            label="Review this application"
            isSubmitting={isPending}
            className="mt-8"
          />
        </form>
      </Form>
      <DialogFormConfirmation {...submitDialog} />
    </>
  );
};

export default ApplicationForm;
