import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ComboBoxFieldType } from '@/types/form-field.types';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { ChevronsUpDown } from 'lucide-react';
import { FieldValues } from 'react-hook-form';
import { Button } from '../../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../ui/command';
import { FormControl } from '../../ui/form';
import { PopoverContent } from '../../ui/popover';
import ComposableField from '../ComposableField';
import ComboboxOption from './combobox-options';
import { handleOptionSelect } from './handleSelect';

interface ComboboxFieldProps<T extends FieldValues>
  extends ComboBoxFieldType<T> {}

const ComboboxField = <T extends FieldValues>({
  ...comboboxField
}: ComboboxFieldProps<T>) => {
  const {
    placeholder,
    disabled,
    comboboxOptions,
    noResults = 'No matching results',
    comboboxTrigger,
    handleSelect,
  } = comboboxField;
  if (!comboboxOptions) return;

  return (
    <ComposableField {...comboboxField}>
      {({ field: { onChange, value } }) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={disabled}
                  className={cn(
                    'w-full justify-between',
                    !value && 'text-muted-foreground',
                  )}
                >
                  {comboboxTrigger(value)}
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className={cn('popover-width-trigger p-0')}
            >
              <Command>
                <CommandInput placeholder={placeholder} />
                <CommandEmpty>{noResults}</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-52">
                    {comboboxOptions.map(
                      ({ value: optionValue, optionLabel, render }) => {
                        const isSelected = value?.toString() === optionValue;
                        const renderOption = render ? render(value) : null; // Safely handle undefined render
                        const handleOption = handleSelect
                          ? handleSelect(optionValue, value)
                          : handleOptionSelect(optionValue, value);
                        return (
                          <CommandItem
                            value={optionLabel}
                            key={optionValue}
                            onSelect={() => onChange(handleOption)}
                          >
                            {renderOption || (
                              <ComboboxOption
                                isSelected={isSelected}
                                optionLabel={optionLabel}
                              />
                            )}
                          </CommandItem>
                        );
                      },
                    )}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    </ComposableField>
  );
};

export default ComboboxField;
