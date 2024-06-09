import { newPassword } from '@/actions/account/new-password.actions';
import {
  NewPasswordForm,
  newPasswordSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const useNewPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isPending, startTransition] = useTransition();

  const form = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<NewPasswordForm> = (values) => {
    startTransition(() => {
      newPassword(values, token).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
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

export default useNewPassword;
