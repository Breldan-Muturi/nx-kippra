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

export const AllowedFileTypes: Blob['type'][] = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

const fileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  lastModified: z.number(),
});
type FileSchema = z.infer<typeof fileSchema>;

const filePreviewSchema = z.object({
  fileUrl: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  fileName: z.string(),
  filePath: z.string().optional(),
});
export type FilePreviewSchema = z.infer<typeof filePreviewSchema>;

const validateFile = (file: any) => {
  if (file instanceof File) {
    return AllowedFileTypes.includes(file.type);
  } else if (file.fileType && typeof file.fileType === 'string') {
    return AllowedFileTypes.includes(file.fileType);
  }
  return false;
};

export const validFileUpload = (optional: boolean = false) =>
  z.array(z.any()).refine(
    (files: any[]) => {
      // Start with any array and refine
      if (optional && files.length === 0) {
        return true; // Optionally allow empty arrays
      }
      return files.every(validateFile); // Validate each item in the array
    },
    {
      message: `All files must be one of the following types: ${AllowedFileTypes.join(', ')}`,
    },
  );

export const AllowedImageTypes: Blob['type'][] = ['image/png', 'image/jpeg'];

export const validImageUpload = (optional: boolean = false) => {
  return z.any().refine(
    (file: File[] | string) => {
      if (optional && !file) return true;
      if (typeof file === 'string') return true;
      return file instanceof File && AllowedImageTypes.includes(file.type);
    },
    {
      message: `The file must be one of the following types: ${AllowedImageTypes.join(', ')}`,
    },
  );
};

export const withIdSchema = <T extends z.ZodObject<any>>(
  schema: T,
  hasId: boolean,
) => {
  if (hasId) {
    return schema.extend({
      id: validString('An item id is required', 1),
    });
  }
  return schema;
};
