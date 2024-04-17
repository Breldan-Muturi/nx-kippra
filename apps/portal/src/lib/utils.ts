import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const resetFieldstoNull = (fields: string[]) => {
  return fields.reduce((acc, field) => {
    return { ...acc, [field]: null };
  }, {});
};

export const removeNullValues = <T extends object>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null),
  );
};
