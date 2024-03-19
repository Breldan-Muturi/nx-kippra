import { SwitchFieldType } from "@/types/form-field.types";
import React from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";

interface SwitchFieldProps<T extends FieldValues> extends SwitchFieldType<T> {}

const SwitchField = <T extends FieldValues>({
  ...switchField
}: SwitchFieldProps<T>) => {
  const { name, label, description, className } = switchField;
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border p-4",
            className,
          )}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={value} onCheckedChange={onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default SwitchField;
