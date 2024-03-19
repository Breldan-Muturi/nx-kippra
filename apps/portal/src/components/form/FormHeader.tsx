import { cn } from "@/lib/utils";
import React from "react";

interface FormHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description?: string;
}

const FormHeader = ({
  label,
  description,
  className,
  ...props
}: FormHeaderProps) => {
  return (
    <div className={cn("my-5 w-full", className)} {...props}>
      <h2 className="text-lg font-semibold text-gray-600">{label}</h2>
      <p className="text-sm italic text-green-600">{description}</p>
    </div>
  );
};
export default FormHeader;
