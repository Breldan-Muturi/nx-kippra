import { clsx, type ClassValue } from 'clsx';
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

export const truncateStrings = (string: string, value: number): string => {
  if (string.length > value) {
    return `${string.slice(0, value)}...`;
  }
  return string;
};

export const formatFileSize = (size: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }
  return `${size.toFixed(2)} ${units[index]}`;
};

export const formatCurrency = (amount: number): string =>
  amount.toLocaleString('en-US');

export const getFirstName = (fullName: string): string => {
  const names = fullName.split(' ');
  if (names.length > 1) return names[0];
  return fullName;
};

export const areObjectsEqual = (obj1: any, obj2: any): boolean =>
  JSON.stringify(obj1) === JSON.stringify(obj2);

export const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toLocaleString('en-US');
  }
};
