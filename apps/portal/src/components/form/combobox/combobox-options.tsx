import { cn } from "@/lib/utils";
import { SelectOptions } from "@/types/form-field.types";
import { Check } from "lucide-react";
import React from "react";

interface ComboboxOptionProps {
  isSelected: boolean;
  optionLabel: SelectOptions["optionLabel"];
}

const ComboboxOption = ({ isSelected, optionLabel }: ComboboxOptionProps) => {
  return (
    <>
      <Check
        color="green"
        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />
      <p className="text-sm font-medium leading-none">{optionLabel}</p>
    </>
  );
};

export default ComboboxOption;
