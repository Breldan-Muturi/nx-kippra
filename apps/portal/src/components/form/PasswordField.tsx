'use client';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordFieldType } from '@/types/form-field.types';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import ComposableField from './ComposableField';

interface PasswordFieldProps<T extends FieldValues>
  extends PasswordFieldType<T> {}

const PasswordField = <T extends FieldValues>({
  ...passwordField
}: PasswordFieldProps<T>) => {
  const [visible, setVisible] = useState(false);
  const { placeholder } = passwordField;
  const type = visible ? 'text' : 'password';
  const Icon = visible ? Eye : EyeOff;

  const handleSetVisible = () => {
    setVisible((prev) => (prev = !prev));
  };
  return (
    <ComposableField {...passwordField}>
      {({ field }) => (
        <div className="relative flex items-center">
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              className="pr-8"
            />
          </FormControl>
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
      )}
    </ComposableField>
  );
};

export default PasswordField;
