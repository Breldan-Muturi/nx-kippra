import {
  CheckFieldType,
  ComboBoxFieldType,
  DateFieldType,
  FileUploadFieldType,
  FormFieldType,
  ImageUploadFieldType,
  PasswordFieldType,
  SearchFieldType,
  SelectFieldType,
  SwitchFieldType,
  TextFieldType,
} from '@/types/form-field.types';
import { FieldValues } from 'react-hook-form';
import CheckField from './CheckField';
import DateField from './DateField';
import PasswordField from './PasswordField';
import SearchField from './SearchField';
import SelectField from './SelectField';
import SwitchField from './SwitchField';
import TextField from './TextField';
import ComboboxField from './combobox/ComboboxField';
import FileUploadField from './files/file-upload-field';
import ImageUploadField from './images/ImageUploadField';

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
          case 'checkbox':
            const checkField = field as CheckFieldType<T>;
            return <CheckField key={key} {...checkField} />;
          case 'password':
            const passwordField = field as PasswordFieldType<T>;
            return <PasswordField key={key} {...passwordField} />;
          case 'singleImage':
            const imageUploadField = field as ImageUploadFieldType<T>;
            return <ImageUploadField key={key} {...imageUploadField} />;
          case 'date':
            const dateField = field as DateFieldType<T>;
            return <DateField key={key} {...dateField} />;
          case 'select':
            const selectField = field as SelectFieldType<T>;
            return <SelectField key={key} {...selectField} />;
          case 'search':
            const searchField = field as SearchFieldType<T>;
            return <SearchField key={key} {...searchField} />;
          case 'combobox':
            const comboboxField = field as ComboBoxFieldType<T>;
            return <ComboboxField key={key} {...comboboxField} />;
          case 'multiple-files':
            const fileUploadField = field as FileUploadFieldType<T>;
            return <FileUploadField key={key} {...fileUploadField} />;
          case 'switch':
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
