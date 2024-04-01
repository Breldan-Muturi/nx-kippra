export type ActionReturnType = {
  error?: string;
  success?: string;
};

export type ActionTriggerType = (actionString: string) => void;
