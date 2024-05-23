'use client';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchFieldType } from '@/types/form-field.types';
import { Search } from 'lucide-react';
import { FieldValues } from 'react-hook-form';
import ComposableField from './ComposableField';

interface SearchFieldProps<T extends FieldValues> extends SearchFieldType<T> {}

const SearchField = <T extends FieldValues>({
  ...searchField
}: SearchFieldProps<T>) => {
  const { type, placeholder } = searchField;
  return (
    <ComposableField {...searchField}>
      {({ field }) => (
        <div className="relative flex items-center">
          <Search className="absolute left-0 w-4 h-4 ml-2 pointer-events-none" />
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className="pl-8 bg-background"
              {...field}
            />
          </FormControl>
        </div>
      )}
    </ComposableField>
  );
};

export default SearchField;
