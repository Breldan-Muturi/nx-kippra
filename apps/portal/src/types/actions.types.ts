export type ActionReturnType = {
  error?: string;
  success?: string;
};

export type ActionTriggerType = (actionString: string) => void;

export type ActionReturnIdType =
  | { error: string }
  | { success: string; recordId: string };
