'use client';

import { FormControl } from '@/components/ui/form';
import { FileUploadFieldType } from '@/types/form-field.types';
import { FieldValues } from 'react-hook-form';
import ComposableField from '../ComposableField';
import FileUploader from './file-uploader';

type FileUploadFieldProps<T extends FieldValues> = FileUploadFieldType<T>;

const FileUploadField = <T extends FieldValues>({
  ...fileUploadField
}: FileUploadFieldProps<T>) => {
  const { placeholder } = fileUploadField;
  return (
    <ComposableField {...fileUploadField}>
      {({ field: { value, onChange } }) => {
        return (
          <FormControl>
            <FileUploader {...{ value, onChange, placeholder }} />
          </FormControl>
        );
      }}
    </ComposableField>
  );
};

export default FileUploadField;
