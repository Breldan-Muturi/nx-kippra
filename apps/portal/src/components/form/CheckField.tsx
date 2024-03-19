import React from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import Link from "next/link";
import { CheckFieldType } from "@/types/form-field.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import DefaultCheckField from "./check/DefaultCheckField";

interface CheckFieldProps<T extends FieldValues> extends CheckFieldType<T> {}

const CheckField = <T extends FieldValues>({
  ...checkField
}: CheckFieldProps<T>) => {
  const { name, className, description, checkComponent } = checkField;
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const checkComponentProps = { value, onChange, description };
        const renderCheckComponent = checkComponent ? (
          checkComponent(checkComponentProps)
        ) : (
          <DefaultCheckField {...checkComponentProps} />
        );
        return (
          <FormItem
            className={cn(
              "col-span-2 flex flex-col items-center justify-center space-x-2",
              className,
            )}
          >
            <FormControl>{renderCheckComponent}</FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default CheckField;
