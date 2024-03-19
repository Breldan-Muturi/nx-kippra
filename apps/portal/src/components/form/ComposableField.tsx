import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormFieldType } from "@/types/form-field.types";
import { cn } from "@/lib/utils";
import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

type ComposableFieldProps<T extends FieldValues> = FormFieldType<T> & {
  children: (props: {
    field: ControllerRenderProps<T, Path<T>>;
  }) => React.ReactNode;
};

const ComposableField = <T extends FieldValues>({
  name,
  children,
  description,
  className,
  label,
}: ComposableFieldProps<T>) => {
  const { control } = useFormContext<T>();
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <FormLabel>{label}</FormLabel>
          {children({ field })}
          <FormMessage />
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
};

export default ComposableField;
