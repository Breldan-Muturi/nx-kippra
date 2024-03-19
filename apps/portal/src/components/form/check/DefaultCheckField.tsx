import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CheckTypeProps } from "@/types/check.types";
import React from "react";

type DefaultCheckFieldProps = CheckTypeProps &
  React.HTMLAttributes<HTMLDivElement>;

const DefaultCheckField = ({
  value,
  onChange,
  className,
  description,
  ...props
}: DefaultCheckFieldProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <Checkbox className="p-0" checked={value} onCheckedChange={onChange} />
      <FormLabel>{description}</FormLabel>
    </div>
  );
};

export default DefaultCheckField;
