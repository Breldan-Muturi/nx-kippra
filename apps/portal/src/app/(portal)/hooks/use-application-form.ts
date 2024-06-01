import { useTransition } from 'react';

const useApplicationForm = () => {
  // TODO: Update this form to handle the applcation form
  const [isPending, startTransition] = useTransition();
  return {
    isPending,
    startTransition,
  };
};

export default useApplicationForm;
