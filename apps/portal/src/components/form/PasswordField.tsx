"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PasswordFieldType } from "@/types/form-field.types";
import ComposableField from "./ComposableField";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldValues } from "react-hook-form";

interface PasswordFieldProps<T extends FieldValues>
  extends PasswordFieldType<T> {}

const PasswordField = <T extends FieldValues>({
  ...passwordField
}: PasswordFieldProps<T>) => {
  const [visible, setVisible] = useState(false);
  const { placeholder } = passwordField;
  const type = visible ? "text" : "password";
  const Icon = visible ? Eye : EyeOff;

  const handleSetVisible = () => {
    setVisible((prev) => (prev = !prev));
  };
  return (
    <ComposableField {...passwordField}>
      {({ field }) => (
        <FormControl>
          <div className="relative flex items-center">
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              className="pr-8"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 w-5 h-5 mr-2 rounded-full"
              onClick={handleSetVisible}
            >
              <Icon className="w-4 h-4" />
            </Button>
          </div>
        </FormControl>
      )}
    </ComposableField>
  );
};

export default PasswordField;
