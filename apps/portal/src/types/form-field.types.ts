import { OurFileRouterKeys } from "@/app/api/uploadthing/core";
import { ComponentPropsWithRef, HTMLInputTypeAttribute } from "react";
import {
  ArrayPath,
  FieldArrayWithId,
  FieldValues,
  Path,
  PathValue,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from "react-hook-form";
import { FileDisplayProps, FileUploaderProps } from "./file.types";
import { CheckTypeProps } from "./check.types";

type BaseFormFieldType<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export type SelectOptions = {
  value: string;
  optionLabel: string;
};

export type DatePresets = {
  value: number;
  dateLabel: string;
};

export type ComboboxSelectOptions<T extends FieldValues> = SelectOptions & {
  render?: (value: PathValue<T, Path<T>>) => React.ReactNode;
};

export type SearchFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "search";
};

export type PasswordFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "password";
};

export type CheckFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "checkbox";
  checkComponent?: ({
    value,
    onChange,
    description,
  }: CheckTypeProps) => React.ReactNode;
};

export type SelectFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "select";
  selectLabel?: string;
  options: SelectOptions[];
};

export type ComboBoxFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "combobox";
  noResults?: string;
  comboboxOptions: ComboboxSelectOptions<T>[];
  comboboxTrigger: (value: PathValue<T, Path<T>>) => React.ReactNode;
  handleSelect?: (
    selectedValue: string,
    value: PathValue<T, Path<T>>,
  ) => PathValue<T, Path<T>>;
};

export type DateFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "date";
  selectLabel?: string;
  minDate?: Date;
  maxDate?: Date;
  datePresets?: DatePresets[];
};

export type FileUploadFieldType<T extends FieldValues> =
  BaseFormFieldType<T> & {
    type: "file";
    endpoint: OurFileRouterKeys;
    fileUploadComponent?: (props: FileUploaderProps) => React.ReactNode;
    fileDisplayComponent?: (props: FileDisplayProps) => React.ReactNode;
  };

export type SwitchFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: "switch";
  label: string;
  description: React.ReactNode;
  asset?: React.ReactNode;
};

export type TextFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type?: Exclude<
    HTMLInputTypeAttribute,
    | "search"
    | "password"
    | "checkbox"
    | "select"
    | "date"
    | "combobox"
    | "file"
    | "array"
  >;
  minValue?: number;
};

export type FormFieldType<T extends FieldValues> =
  | TextFieldType<T>
  | SearchFieldType<T>
  | PasswordFieldType<T>
  | CheckFieldType<T>
  | SelectFieldType<T>
  | ComboBoxFieldType<T>
  | FileUploadFieldType<T>
  | SwitchFieldType<T>
  | DateFieldType<T>;
