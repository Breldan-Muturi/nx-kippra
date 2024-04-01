import React from 'react';
import { Select, SelectGroup } from '../ui/select';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { FieldValues } from 'react-hook-form';
import { SelectFieldType } from '@/types/form-field.types';
import ComposableField from './ComposableField';
import { FormControl } from '../ui/form';
import { SelectLabel } from '@radix-ui/react-select';

interface SelectFieldProps<T extends FieldValues> extends SelectFieldType<T> {}

const SelectField = <T extends FieldValues>({
  ...selectField
}: SelectFieldProps<T>) => {
  const {
    placeholder,
    options,
    disabled,
    selectLabel = 'Select option',
  } = selectField;
  if (!options) return;
  return (
    <ComposableField {...selectField}>
      {({ field: { onChange, value } }) => (
        <FormControl>
          <Select
            onValueChange={(newValue) => {
              onChange(newValue === value ? undefined : newValue);
            }}
            defaultValue={value}
            value={value ? value : undefined}
            disabled={disabled}
          >
            <SelectTrigger>
              {value ? <SelectValue placeholder={placeholder} /> : placeholder}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="py-1 pl-2">{selectLabel}</SelectLabel>
                {options.map(({ optionLabel, value }, i) => (
                  <SelectItem key={`${i}-${value}`} value={value}>
                    {optionLabel}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormControl>
      )}
    </ComposableField>
  );
};

export default SelectField;
