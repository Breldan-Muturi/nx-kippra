'use client';
import { ImageUploadFieldType } from '@/types/form-field.types';
import React from 'react';
import { FieldValues } from 'react-hook-form';
import ComposableField from '../ComposableField';
import { FormControl } from '../../ui/form';
import ImageUploader from './ImageUploader';

interface ImageUploadFieldProps<T extends FieldValues>
  extends ImageUploadFieldType<T> {}

const ImageUploadField = <T extends FieldValues>({
  ...imageUploadField
}: ImageUploadFieldProps<T>) => {
  return (
    <ComposableField {...imageUploadField}>
      {({ field: { value, onChange } }) => {
        return (
          <FormControl>
            <ImageUploader {...{ value, onChange }} />
          </FormControl>
        );
      }}
    </ComposableField>
  );
};

export default ImageUploadField;
