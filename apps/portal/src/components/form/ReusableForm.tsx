import React from "react";
import TextField from "./TextField";
import CheckField from "./CheckField";
import PasswordField from "./PasswordField";
import {
  CheckFieldType,
  ComboBoxFieldType,
  DateFieldType,
  FileUploadFieldType,
  FormFieldType,
  PasswordFieldType,
  SearchFieldType,
  SelectFieldType,
  SwitchFieldType,
  TextFieldType,
} from "@/types/form-field.types";
import { FieldValues } from "react-hook-form";
import DateField from "./DateField";
import SelectField from "./SelectField";
import SearchField from "./SearchField";
import ComboboxField from "./combobox/ComboboxField";
import FileUploadField from "./FileUploadField";
import SwitchField from "./SwitchField";

interface ReusableFormProps<T extends FieldValues> {
  formFields: FormFieldType<T>[];
}

const ReusableForm = <T extends FieldValues>({
  formFields,
}: ReusableFormProps<T>) => {
  return (
    <>
      {formFields.map((field, i) => {
        const { type, name } = field;
        const key = `${name}-${i}`;
        switch (type) {
          case "checkbox":
            const checkField = field as CheckFieldType<T>;
            return <CheckField key={key} {...checkField} />;
          case "password":
            const passwordField = field as PasswordFieldType<T>;
            return <PasswordField key={key} {...passwordField} />;
          case "date":
            const dateField = field as DateFieldType<T>;
            return <DateField key={key} {...dateField} />;
          case "select":
            const selectField = field as SelectFieldType<T>;
            return <SelectField key={key} {...selectField} />;
          case "search":
            const searchField = field as SearchFieldType<T>;
            return <SearchField key={key} {...searchField} />;
          case "combobox":
            const comboboxField = field as ComboBoxFieldType<T>;
            return <ComboboxField key={key} {...comboboxField} />;
          case "file":
            const fileUploadField = field as FileUploadFieldType<T>;
            return <FileUploadField key={key} {...fileUploadField} />;
          case "switch":
            const switchField = field as SwitchFieldType<T>;
            return <SwitchField key={key} {...switchField} />;
          default:
            const textField = field as TextFieldType<T>;
            return <TextField key={key} {...textField} />;
        }
      })}
    </>
  );
};

export default ReusableForm;
