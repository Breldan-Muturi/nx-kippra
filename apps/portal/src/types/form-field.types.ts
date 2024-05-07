import { HTMLInputTypeAttribute } from 'react';
import { FieldValues, Path, PathValue } from 'react-hook-form';
import { CheckTypeProps } from './check.types';

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
  type: 'search';
};

export type PasswordFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: 'password';
};

export type ImageUploadFieldType<T extends FieldValues> =
  BaseFormFieldType<T> & {
    type: 'singleImage';
  };

export type FileUploadFieldType<T extends FieldValues> =
  BaseFormFieldType<T> & {
    type: 'multiple-files';
  };

export type CheckFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: 'checkbox';
  checkComponent?: ({
    value,
    onChange,
    description,
  }: CheckTypeProps) => React.ReactNode;
};

export type SelectFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: 'select';
  selectLabel?: string;
  options: SelectOptions[];
};

export type ComboBoxFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: 'combobox';
  noResults?: string;
  comboboxOptions: ComboboxSelectOptions<T>[];
  comboboxTrigger: (value: PathValue<T, Path<T>>) => React.ReactNode;
  handleSelect?: (
    selectedValue: string,
    value: PathValue<T, Path<T>>,
  ) => PathValue<T, Path<T>>;
};

export type DateFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: 'date';
  selectLabel?: string;
  minDate?: Date;
  maxDate?: Date;
  datePresets?: DatePresets[];
};

export type SwitchFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type: 'switch';
  label: string;
  description: React.ReactNode;
  asset?: React.ReactNode;
};

export type TextFieldType<T extends FieldValues> = BaseFormFieldType<T> & {
  type?: Exclude<
    HTMLInputTypeAttribute,
    | 'search'
    | 'password'
    | 'checkbox'
    | 'select'
    | 'date'
    | 'combobox'
    | 'file'
    | 'array'
    | 'singleImage'
    | 'multiple-files'
  >;
  minValue?: number;
};

export type FormFieldType<T extends FieldValues> =
  | TextFieldType<T>
  | SearchFieldType<T>
  | PasswordFieldType<T>
  | ImageUploadFieldType<T>
  | FileUploadFieldType<T>
  | CheckFieldType<T>
  | SelectFieldType<T>
  | ComboBoxFieldType<T>
  | SwitchFieldType<T>
  | DateFieldType<T>;
