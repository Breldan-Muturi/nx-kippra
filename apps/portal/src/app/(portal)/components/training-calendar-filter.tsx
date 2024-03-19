"use client";
import ReusableForm from "@/components/form/ReusableForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { filterCourse } from "@/actions/training-session/training-session.actions";
import { FormFieldType } from "@/types/form-field.types";
import { cn } from "@/lib/utils";
import {
  FilterTrainingSessionSchemaType,
  filterTrainingSessionsSchema,
} from "@/validation/training-session.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
interface TrainingCalendarFilterProps
  extends React.ComponentPropsWithoutRef<"div"> {
  filterFields: FormFieldType<FilterTrainingSessionSchemaType>[];
  filterValues: FilterTrainingSessionSchemaType;
}

const TrainingCalendarFilter = ({
  filterValues,
  filterFields,
  className,
  ...props
}: TrainingCalendarFilterProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<FilterTrainingSessionSchemaType>({
    resolver: zodResolver(filterTrainingSessionsSchema),
    mode: "onChange",
    defaultValues: filterValues,
  });

  const { watch, reset, handleSubmit } = form;

  const isAnyFieldFilled = () => {
    return Object.values(watch()).some(
      (value) => value !== null && value !== "" && value,
    );
  };

  const onSubmit: SubmitHandler<FilterTrainingSessionSchemaType> = (values) => {
    startTransition(() => {
      filterCourse(values);
    });
  };

  const onClear = () => {
    reset({
      name: "",
      mode: undefined,
      endDate: undefined,
      venue: undefined,
      startDate: undefined,
    });
    router.push("/", { scroll: false });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col space-y-2 py-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div
          className={cn(
            "grid w-full grid-cols-1 items-center gap-y-3 md:grid-cols-2 md:gap-x-3 lg:grid-cols-5 lg:items-start",
          )}
          {...props}
        >
          <ReusableForm formFields={filterFields} />
        </div>
        {isAnyFieldFilled() && (
          <div className="flex items-center gap-x-3">
            <Button
              type="submit"
              variant="default"
              className="gap-x-3 bg-green-600 hover:bg-green-800"
            >
              {isPending ? (
                <Loader2 color="white" className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 color="white" />
              )}
              Apply filter
            </Button>
            <Button
              type="button"
              variant="link"
              className="gap-x-3 text-red-600"
              onClick={onClear}
            >
              <Trash2 color="red" size={20} />
              Clear
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default TrainingCalendarFilter;
