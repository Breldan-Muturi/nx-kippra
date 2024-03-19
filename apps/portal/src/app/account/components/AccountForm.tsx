import ReusableForm from "@/components/form/ReusableForm";
import { FormFieldType } from "@/types/form-field.types";
import { cn } from "@/lib/utils";
import React from "react";
import { FieldValues } from "react-hook-form";

interface AccountFormProps<T extends FieldValues>
  extends React.HTMLAttributes<HTMLDivElement> {
  accountFields: FormFieldType<T>[];
}

const AccountForm = <T extends FieldValues>({
  accountFields,
  className,
}: AccountFormProps<T>) => {
  return (
    <div className={cn("grid w-full grid-cols-2 gap-4", className)}>
      <ReusableForm formFields={accountFields} />
    </div>
  );
};

export default AccountForm;
