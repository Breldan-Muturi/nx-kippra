import { reset } from '@/actions/account/reset.actions';
import {
  EmailValidationType,
  emailValidation,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const useResetPassword = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmailValidationType>({
    resolver: zodResolver(emailValidation),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<EmailValidationType> = (values) => {
    startTransition(() => {
      reset(values).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
        }
      });
    });
  };

  return {
    form,
    isPending,
    onSubmit,
  };
};

export default useResetPassword;
