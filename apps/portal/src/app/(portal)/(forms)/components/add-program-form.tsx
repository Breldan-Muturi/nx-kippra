"use client";
import { FormFieldType, SelectOptions } from "@/types/form-field.types";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import React, { useTransition } from "react";
import FormHeader from "@/components/form/FormHeader";
import ReusableForm from "@/components/form/ReusableForm";
import SubmitButton from "@/components/form/SubmitButton";
import {
  NewProgramForm,
  newProgramSchema,
} from "@/validation/program.validation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { programServices } from "@/constants/program.constants";
import ComboboxOption from "../../../../components/form/combobox/combobox-options";
import { useRouter } from "next/navigation";
import { newProgram } from "@/actions/programmes/programmes.action";
import { toast } from "sonner";

const programFields = (
  programOptions?: SelectOptions[],
  moodleCourseOptions?: SelectOptions[],
): FormFieldType<NewProgramForm>[] => {
  let programFields: FormFieldType<NewProgramForm>[] = [
    {
      name: "imgUrl",
      label: "Course Image (Click to update)",
      description: "Update the course image",
      className: "h-full",
      type: "file",
      endpoint: "serverImage",
      fileDisplayComponent: ({ value, onChange }) => (
        <div className="relative h-[400px] w-full rounded-xl ring-2 ring-green-600">
          <Image
            src={value}
            fill
            alt="Uploaded  course image"
            className="rounded-xl"
          />
          <Button
            variant="destructive"
            size="icon"
            title="Remove image"
            className="absolute right-0 top-0 h-5 w-5 rounded-full"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      name: "title",
      label: "Course Title",
      placeholder: "Enter course title",
      type: "text",
    },
    {
      name: "code",
      label: "Course Code",
      placeholder: "Enter course code",
      type: "text",
    },
    {
      name: "summary",
      label: "Course Summary",
      placeholder: "Enter the course summary",
      type: "textarea",
    },
    {
      name: "serviceId",
      type: "combobox",
      label: "eCitizen Service Name",
      noResults: "No matching eCitizen service names",
      description:
        "The service name links this course to eCitizen for payment recording",
      comboboxOptions: programServices.map(({ serviceId, serviceName }) => ({
        value: serviceId.toString(),
        optionLabel: serviceName,
      })),
      comboboxTrigger: (value) => {
        switch (value) {
          case undefined:
            return "Select an eCitizen service name";
          default:
            return programServices.find(({ serviceId }) => serviceId === value)
              ?.serviceName;
        }
      },
      handleSelect: (selectedValue, value) => {
        const intSelectedValue = parseInt(selectedValue);
        if (intSelectedValue === value) {
          return undefined;
        } else {
          return intSelectedValue;
        }
      },
    },
  ];

  if (programOptions && programOptions.length > 0) {
    programFields.push({
      name: "prerequisiteCourses",
      type: "combobox",
      label: "Prerequisite Courses",
      className: "col-span-2",
      noResults: "No program found",
      description:
        "Select courses that need to be completed before applying for this one",
      comboboxOptions: programOptions.map(
        ({ value: programValue, optionLabel }) => ({
          value: programValue,
          optionLabel,
          render: (value) => {
            const isSelected = Array.isArray(value)
              ? value.includes(programValue)
              : false;
            return (
              <ComboboxOption
                isSelected={isSelected}
                optionLabel={optionLabel}
              />
            );
          },
        }),
      ),
      comboboxTrigger: (value) => {
        if (!Array.isArray(value) || !value.length) {
          return "Select prerequisite course";
        } else if (value.length > 1) {
          return `${value.length} courses selected`;
        } else {
          return programOptions.find(
            ({ value: optionValue }) => optionValue === value[0],
          )?.optionLabel;
        }
      },
      handleSelect: (selectedValue, value) => {
        const selectedProgramValue = programOptions.find(
          ({ value }) => value === selectedValue,
        )?.value;
        if (!selectedProgramValue) return value;
        if (Array.isArray(value)) {
          const newValue = value.some((v) => v === selectedValue)
            ? value.filter((v) => v !== selectedValue) // Remove if present
            : [...value, selectedProgramValue]; // Add if not present
          return newValue;
        }
        return [selectedProgramValue];
      },
    });

    if (moodleCourseOptions && moodleCourseOptions.length > 0) {
      programFields.push({
        name: "moodleCourseId",
        type: "combobox",
        label: "Connect an moodle course",
        noResults: "No matching moodle course",
        description:
          "This will link the program to a specific Moodle course in order to enable enrollment",
        comboboxOptions: moodleCourseOptions.map(({ value, optionLabel }) => ({
          value,
          optionLabel,
        })),
        handleSelect: (selectedValue, value) => {
          const intSelectedValue = parseInt(selectedValue);
          if (intSelectedValue === value) {
            return undefined;
          } else {
            return intSelectedValue;
          }
        },
        comboboxTrigger: (value) => {
          if (value) {
            return moodleCourseOptions.find(
              ({ value: moodleCourseValue }) =>
                value.toString() === moodleCourseValue,
            )?.optionLabel;
          } else {
            return "Select a moodle course";
          }
        },
      });
    }
  }
  return programFields;
};

interface AddProgramFormProps {
  programOptions?: SelectOptions[];
  moodleCourseOptions?: SelectOptions[];
}

const AddProgramForm = ({
  programOptions,
  moodleCourseOptions,
}: AddProgramFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<NewProgramForm>({
    resolver: zodResolver(newProgramSchema),
    mode: "onChange",
    defaultValues: {
      imgUrl: "",
      title: "",
      code: "",
      prerequisiteCourses: [],
      summary: "",
    },
  });

  const onSubmit = (programInput: NewProgramForm) => {
    startTransition(() => {
      newProgram(programInput).then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success(data.success, {
            action: {
              label: "View Program",
              onClick: () => router.push(`/${data.programId}`),
            },
          });
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-x-4 gap-y-2 self-center p-8 md:w-3/4 md:pt-12"
      >
        <FormHeader
          label="New program"
          description="Complete the form below and submit to add a program"
        />
        <ReusableForm
          formFields={programFields(programOptions, moodleCourseOptions)}
        />
        <SubmitButton
          label="Create a New Course"
          isSubmitting={isPending}
          className="my-8 w-full"
        />
      </form>
    </Form>
  );
};

export default AddProgramForm;
