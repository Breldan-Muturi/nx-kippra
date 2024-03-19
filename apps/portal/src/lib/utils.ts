import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const resetFieldstoNull = (fields: string[]) => {
  return fields.reduce((acc, field) => {
    return { ...acc, [field]: null };
  }, {});
};
