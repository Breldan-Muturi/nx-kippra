import { DateFieldType } from "@/types/form-field.types";
import React from "react";
import ComposableField from "./ComposableField";
import { FormControl } from "@/components/ui/form";
import { FieldValues } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { addDays, format, min } from "date-fns";
import { cn } from "@/lib/utils";

interface DateFieldProps<T extends FieldValues> extends DateFieldType<T> {}

const DateField = <T extends FieldValues>({
  ...dateField
}: DateFieldProps<T>) => {
  const {
    placeholder = "Pick a date",
    selectLabel = "Select preset",
    maxDate,
    minDate,
    datePresets,
  } = dateField;

  return (
    <ComposableField {...dateField}>
      {({ field: { value, onChange } }) => {
        const selectedOption =
          value &&
          datePresets
            ?.filter(
              ({ value: dateValue }) =>
                format(addDays(new Date(), dateValue), "PPP") ===
                format(value, "PPP"),
            )
            .map(({ dateLabel }) => dateLabel)[0];
        const disabledDates = (date: Date) => {
          return (
            (minDate && date < minDate) || (maxDate && date > maxDate) || false
          );
        };

        return (
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "PPP") : <span>{placeholder}</span>}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
              {datePresets && (
                <Select
                  onValueChange={(value) =>
                    onChange(addDays(new Date(), parseInt(value)))
                  }
                  defaultValue={value}
                >
                  <SelectTrigger>{selectedOption ?? selectLabel}</SelectTrigger>
                  <SelectContent position="popper">
                    {datePresets.map(({ value, dateLabel }, i) => (
                      <SelectItem
                        key={`${i}-${dateLabel}`}
                        value={String(value)}
                      >
                        {dateLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="rounded-md border">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={onChange}
                  disabled={(date) => disabledDates(date)}
                />
              </div>
            </PopoverContent>
          </Popover>
        );
      }}
    </ComposableField>
  );
};

export default DateField;
