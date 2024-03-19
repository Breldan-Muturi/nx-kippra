"use client";

import SelectField from "@/components/form/SelectField";
import TextField from "@/components/form/TextField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { citizenshipOptions } from "@/helpers/enum.helpers";
import { cn } from "@/lib/utils";
import { SelectOptions } from "@/types/form-field.types";
import { NewApplicationForm } from "@/validation/application.validation";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";
import { FieldArrayWithId, useFormContext } from "react-hook-form";

interface AddParticipantProps
  extends React.ComponentPropsWithoutRef<"section"> {
  index: number;
  field: FieldArrayWithId<NewApplicationForm, "participants", "id">;
  organizationOptions: SelectOptions[];
  badgeText: string;
}

const AddParticipant = ({
  index,
  field,
  organizationOptions,
  badgeText,
  className,
  ...sectionProps
}: AddParticipantProps) => {
  const { control, setValue, getValues } = useFormContext<NewApplicationForm>();
  const [open, setOpen] = useState(false);
  const [commandInputValue, setCommandInputValue] = useState("");

  const showButton =
    commandInputValue.length > 0 &&
    organizationOptions
      .map(({ optionLabel }) => optionLabel)
      .filter((optionLabel) => optionLabel.includes(commandInputValue)).length <
      1;

  const handleCommandInputChange = (value: string) => {
    setCommandInputValue(value);
  };

  const handleOrganizationSelect = (
    organizationName: string,
    organizationId?: string,
  ) => {
    setValue(`participants.${index}.organizationName`, organizationName);
    if (organizationId) {
      setValue(`participants.${index}.organizationId`, organizationId);
    } else {
      setValue(`participants.${index}.organizationId`, undefined);
    }
    setOpen(false);
  };

  const isRegistered = !!getValues(`participants.${index}.userId`);
  const disableName = isRegistered && !!getValues(`participants.${index}.name`);
  const disableEmail =
    isRegistered && !!getValues(`participants.${index}.email`);
  const disableCitizenship =
    isRegistered && !!getValues(`participants.${index}.citizenship`);
  const disableNationId =
    isRegistered && !!getValues(`participants.${index}.nationalId`);

  return (
    <section className="flex flex-col items-start">
      <div className="mb-6 flex items-center space-x-2">
        <Badge>{badgeText}</Badge>
        <Badge
          variant={isRegistered ? "default" : "outline"}
          className={cn(
            isRegistered ? "bg-green-600" : "border-2 border-gray-400",
          )}
        >
          {isRegistered ? "Registered" : "New participant"}
        </Badge>
      </div>
      <div
        className={cn(
          "grid flex-grow grid-cols-2 gap-x-2 gap-y-4 self-stretch ",
          className,
        )}
        {...sectionProps}
      >
        <TextField<NewApplicationForm>
          name={`participants.${index}.name`}
          label="Participant name"
          description="Enter participant full name"
          placeholder="Anne Wanjiku"
          type="text"
          disabled={disableName}
        />
        <TextField<NewApplicationForm>
          name={`participants.${index}.email`}
          label="Participant email"
          description="Enter valid participant email"
          placeholder="anne.wanjiku@email.com"
          type="email"
          disabled={disableEmail}
        />
        <SelectField<NewApplicationForm>
          name={`participants.${index}.citizenship`}
          options={citizenshipOptions}
          type="select"
          description="Enter participant citizenship"
          label="Kenyan"
          placeholder="Participant citizenship"
          selectLabel="Citizenship options"
          disabled={disableCitizenship}
        />
        <TextField<NewApplicationForm>
          name={`participants.${index}.nationalId`}
          type="text"
          label="Enter National Id"
          description="Passport or Id"
          disabled={disableNationId}
        />
        <FormField
          control={control}
          name={`participants.${index}.organizationName`}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Enter participant organization name</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                      onClick={() => setOpen(!open)}
                    >
                      {field.value || "Enter organization name"}{" "}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="popover-width-trigger p-0"
                  align="start"
                >
                  <Command>
                    <div className="relative items-center">
                      <CommandInput
                        placeholder="Enter a new organization or select an existing one"
                        className="w-full pr-8"
                        onValueChange={(value) =>
                          handleCommandInputChange(value)
                        }
                      />
                      {showButton && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="default"
                              size="icon"
                              className="absolute right-0 top-2 mr-2 size-6  rounded-full bg-green-600/80 hover:bg-green-600"
                              title="Confirm new organization"
                              onClick={() =>
                                handleOrganizationSelect(commandInputValue)
                              }
                            >
                              <Check className="size-4" color="white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Confirm new organization
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <CommandEmpty>Entering a new organization</CommandEmpty>
                    <CommandGroup>
                      {organizationOptions.map(({ value, optionLabel }, i) => {
                        const isSelected =
                          value ===
                          getValues(`participants.${index}.organizationId`);
                        return (
                          <CommandItem
                            value={value}
                            key={`${i}${value}`}
                            onSelect={() =>
                              handleOrganizationSelect(optionLabel, value)
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {optionLabel}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Either select an existing organization, or enter a new
                organization and click the check to confirm
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
};

export default AddParticipant;
