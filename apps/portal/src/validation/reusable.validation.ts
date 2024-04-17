import { Path } from 'react-hook-form';
import { ZodObject, ZodRawShape, z } from 'zod';

export const PASSWORD_MISMATCH_MESSAGE = 'Passwords do not match';
export const DATES_MISMATCH_MESSAGE = 'End date cannot come before start date';

export const email = z.string().email('Enter a valid email');
export const requiredField = z.string().min(1, 'This field is required');
export const validUrl = (message?: string) =>
  z.string().url(message ?? 'Please enter a valid url');

export const validString = (errorMessage?: string, count?: number) => {
  const message = errorMessage ?? 'A required variable is missing';
  const number = count ?? 1;
  return z.string().min(number, message);
};

export const characterCount = (
  minCount: number,
  maxCount: number,
  errorMessage?: string,
) => {
  const message =
    errorMessage ?? `Only ${minCount} to ${maxCount} characters allowed`;
  return z.string().min(minCount, message).max(maxCount, message);
};

export const requiredCheck = (errorMessage: string) =>
  z.boolean().refine((val) => val === true, errorMessage);

export const matchingPasswords = <T extends ZodRawShape>(
  schema: ZodObject<T>,
  comparePath: Path<T>,
  path: Path<T>,
  message?: string,
) => {
  return schema.refine((data) => data[comparePath] === data[path], {
    message: message ?? PASSWORD_MISMATCH_MESSAGE,
    path: [path],
  });
};

export const validateDateRange = <T extends ZodRawShape>(
  schema: ZodObject<T>,
  startDate: Path<T>,
  endDate: Path<T>,
  message?: string,
) => {
  return schema.refine(
    (data) => {
      if (!data[startDate] || !data[endDate]) return true;
      return data[startDate] <= data[endDate];
    },
    {
      message: message ?? DATES_MISMATCH_MESSAGE,
      path: [endDate],
    },
  );
};

export const AllowedImageTypes: Blob['type'][] = ['image/png', 'image/jpeg'];

export const validImageUpload = (optional: boolean = false) => {
  return z.any().refine(
    (file: File | string) => {
      if (optional && !file) return true;
      if (typeof file === 'string') return true;
      return file instanceof File && AllowedImageTypes.includes(file.type);
    },
    {
      message: `The file must be one of the following types: ${AllowedImageTypes.join(', ')}`,
    },
  );
};
