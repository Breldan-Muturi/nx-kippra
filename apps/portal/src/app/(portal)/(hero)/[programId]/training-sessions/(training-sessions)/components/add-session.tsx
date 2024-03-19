"use client";

import { FormFieldType } from "@/types/form-field.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import ReusableForm from "@/components/form/ReusableForm";
import SubmitButton from "@/components/form/SubmitButton";
import {
  NewTrainingSessionForm,
  newTrainingSessionSchema,
  trainingSessionSchema,
} from "@/validation/training-session.validation";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliveryModeOptions, venueOptions } from "@/helpers/enum.helpers";
import { Delivery } from "@prisma/client";
import { newTrainingSession } from "@/actions/training-session/training-session.actions";
import { toast } from "sonner";

const newTrainingSessionFields = (
  hasDifferentFees: boolean,
  mode?: Delivery,
): FormFieldType<NewTrainingSessionForm>[] => {
  const expandOnPremisesFields =
    mode && mode === Delivery.ON_PREMISE ? "col-span-2" : undefined;
  const expandOnlineFields =
    mode && mode === Delivery.ONLINE ? "col-span-2" : undefined;

  const venue: FormFieldType<NewTrainingSessionForm> = {
    name: "venue",
    label: "Session Venue",
    placeholder: "Enter session venue",
    type: "select",
    selectLabel: "Available venues",
    options: venueOptions,
  };

  // Forms for adding fees
  const citizenFee: FormFieldType<NewTrainingSessionForm> = {
    name: "citizenFee",
    label: "Citizen: On premise fee",
    placeholder: "eg. 100000",
    type: "number",
    className: expandOnPremisesFields,
  };
  const citizenOnlineFee: FormFieldType<NewTrainingSessionForm> = {
    name: "citizenOnlineFee",
    label: "Citizen: online fee",
    placeholder: "eg. 100000",
    type: "number",
    className: expandOnlineFields,
  };
  const eastAfricaFee: FormFieldType<NewTrainingSessionForm> = {
    name: "eastAfricaFee",
    label: "East Africa: On premise fee",
    placeholder: "eg. 100000",
    type: "number",
    className: expandOnPremisesFields,
  };
  const eastAfricaFeeOnline: FormFieldType<NewTrainingSessionForm> = {
    name: "eastAfricaOnlineFee",
    label: "East Africa: Online fee",
    placeholder: "eg. 100000",
    type: "number",
    className: expandOnlineFields,
  };
  const globalFee: FormFieldType<NewTrainingSessionForm> = {
    name: "globalParticipantFee",
    label: "Global: On premise fee",
    placeholder: "eg. 100000",
    type: "number",
    className: expandOnPremisesFields,
  };
  const globalFeeOnline: FormFieldType<NewTrainingSessionForm> = {
    name: "globalParticipantOnlineFee",
    label: "Global: Online fee",
    placeholder: "eg. 100000",
    type: "number",
    className: expandOnlineFields,
  };

  // Fields for slots
  const onPremiseSlots: FormFieldType<NewTrainingSessionForm> = {
    name: "onPremiseSlots",
    label: "Slots: Onpremise",
    placeholder: "eg. 50",
    type: "number",
    className: expandOnPremisesFields,
  };
  const onlineSlots: FormFieldType<NewTrainingSessionForm> = {
    name: "onlineSlots",
    label: "Slots: Online",
    placeholder: "eg. 30",
    type: "number",
    className: expandOnlineFields,
  };

  let fieldSettings: FormFieldType<NewTrainingSessionForm>[] = [
    {
      name: "mode",
      label: "Select the mode of delivery",
      placeholder: "Select delivery mode",
      selectLabel: "Delivery modes",
      type: "select",
      options: deliveryModeOptions,
      className: expandOnlineFields,
    },
  ];
  let fieldCitizenFees: FormFieldType<NewTrainingSessionForm>[] = [];
  let fieldSlots: FormFieldType<NewTrainingSessionForm>[] = [];
  let fieldEastAfricaFees: FormFieldType<NewTrainingSessionForm>[] = [];
  let fieldGlobalFees: FormFieldType<NewTrainingSessionForm>[] = [];

  switch (mode) {
    case Delivery.ONLINE:
      fieldCitizenFees = [citizenOnlineFee];
      fieldSlots = [onlineSlots];
      if (hasDifferentFees) {
        fieldEastAfricaFees = [eastAfricaFeeOnline];
        fieldGlobalFees = [globalFeeOnline];
      }
      break;
    case Delivery.ON_PREMISE:
      fieldCitizenFees = [citizenFee];
      fieldSlots = [onPremiseSlots];
      fieldSettings.push(venue);
      if (hasDifferentFees) {
        fieldEastAfricaFees = [eastAfricaFee];
        fieldGlobalFees = [globalFee];
      }
      break;
    case Delivery.BOTH_MODES:
      fieldCitizenFees = [citizenFee, citizenOnlineFee];
      fieldSlots = [onPremiseSlots, onlineSlots];
      fieldSettings.push(venue);
      if (hasDifferentFees) {
        fieldEastAfricaFees = [eastAfricaFee, eastAfricaFeeOnline];
        fieldGlobalFees = [globalFee, globalFeeOnline];
      }
      break;
  }

  return [
    {
      name: "startDate",
      label: "Session Start Date",
      placeholder: "1/24/2024",
      type: "date",
    },
    {
      name: "endDate",
      label: "Session End Date",
      placeholder: "1/24/2024",
      type: "date",
    },
    ...fieldSettings,
    {
      name: "usingDifferentFees",
      type: "checkbox",
      className: "col-span-2 items-start py-4",
      description: "Different citizenship fees",
    },
    ...fieldCitizenFees,
    ...fieldEastAfricaFees,
    ...fieldGlobalFees,
    ...fieldSlots,
  ];
};

interface AddSessionProps extends React.HTMLAttributes<HTMLDivElement> {
  programId: string;
}
const AddSession = ({ programId, className, ...props }: AddSessionProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dismissModal = () => router.push(`/${programId}/training-sessions`);
  const form = useForm<NewTrainingSessionForm>({
    resolver: zodResolver(newTrainingSessionSchema),
    mode: "onChange",
    defaultValues: {
      programId,
      usingDifferentFees: false,
    },
  });
  const { handleSubmit, getValues, reset, watch } = form;
  const hasDifferentFees = watch("usingDifferentFees") === true;
  const mode = watch("mode");
  console.log(
    "Form validation: ",
    newTrainingSessionSchema.safeParse(getValues()),
  );

  useEffect(() => {
    let needReset = false;
    const currentValues = getValues();

    switch (mode) {
      case Delivery.ONLINE:
        currentValues.citizenFee = undefined;
        currentValues.eastAfricaFee = undefined;
        currentValues.globalParticipantFee = undefined;
        currentValues.venue = undefined;
        currentValues.onPremiseSlots = undefined;
        needReset = true;
      case Delivery.ON_PREMISE:
        currentValues.citizenOnlineFee = undefined;
        currentValues.eastAfricaOnlineFee = undefined;
        currentValues.globalParticipantOnlineFee = undefined;
        currentValues.onlineSlots = undefined;
        needReset = true;
    }

    if (!hasDifferentFees) {
      currentValues.eastAfricaFee = undefined;
      currentValues.eastAfricaOnlineFee = undefined;
      currentValues.globalParticipantFee = undefined;
      currentValues.globalParticipantOnlineFee = undefined;
      needReset = true;
    }

    if (needReset) {
      reset(currentValues);
    }
  }, [getValues, reset, mode, hasDifferentFees]);

  const onSubmit = (data: NewTrainingSessionForm) => {
    startTransition(() => {
      newTrainingSession(data)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            toast.success(data.success);
          }
        })
        .finally(dismissModal);
    });
  };
  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className={className} {...props}>
        <DialogHeader>
          <DialogTitle>New training session</DialogTitle>
          <DialogDescription className="text-green-600">
            Submit details for the new training session
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-2"
          >
            <ReusableForm
              formFields={newTrainingSessionFields(hasDifferentFees, mode)}
            />
            <SubmitButton
              className="my-4"
              label="Add Session"
              isSubmitting={isPending}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSession;
