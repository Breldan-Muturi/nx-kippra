import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextFieldType } from '@/types/form-field.types';
import React from 'react';
import { FieldValues } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import ComposableField from './ComposableField';

interface TextFieldProps<T extends FieldValues> extends TextFieldType<T> {}

const TextField = <T extends FieldValues>({
  ...textField
}: TextFieldProps<T>) => {
  const { type = 'text', placeholder, disabled, minValue } = textField;
  // Determine the component based on the type
  const Component = type === 'textarea' ? Textarea : Input;
  return (
    <ComposableField {...textField}>
      {({ field: { value, onChange, ...field } }) => {
        // Correctly handle change events
        const handleChange = (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          // Get the current input value
          const newValue = e.target.value;
          if (type === 'number') {
            if (minValue) {
              const numberValue = newValue
                ? Number(newValue) < minValue
                  ? minValue
                  : Number(newValue)
                : minValue;
              onChange(numberValue);
            } else {
              // Convert to number or reset to empty string if invalid
              const numberValue = newValue ? Number(newValue) : 0;
              onChange(numberValue);
            }
          } else {
            onChange(newValue);
          }
        };
        return (
          <FormControl>
            <Component
              type={type}
              placeholder={placeholder}
              value={value || ''}
              onChange={handleChange}
              {...field}
              className="bg-background"
              disabled={disabled}
            />
          </FormControl>
        );
      }}
    </ComposableField>
  );
};

export default TextField;
