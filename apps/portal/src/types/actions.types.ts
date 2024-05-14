import { Path } from 'react-hook-form';

export type ActionReturnType = {
  error?: string;
  success?: string;
};

export type ActionTriggerType = (actionString: string) => void;

export type FormError<T> = {
  field: Path<T>;
  message: string;
};

export type ActionReturnIdType =
  | { error: string }
  | { success: string; recordId: string };
