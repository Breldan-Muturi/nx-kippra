'use client';

import { LoginReturn, login } from '@/actions/account/login.actions';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { SignInProvider } from '@/types/account.types';
import {
  LoginForm,
  loginSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ZodOptional } from 'zod';

const useLoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [isPending, startTransition] = useTransition();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: Object.fromEntries(
      Object.entries(loginSchema.shape).map(([key, value]) => [
        key,
        value instanceof ZodOptional ? undefined : '',
      ]),
    ),
  });

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    startTransition(async () => {
      try {
        const data = await login(values, callbackUrl);
        if (data) {
          const loginData = data as LoginReturn;
          if ('error' in loginData) {
            form.reset();
            toast.error(loginData.error);
          }
          if ('success' in loginData) {
            form.reset();
            toast.success(loginData.success);
          }
          if ('twoFactor' in loginData) {
            setShowTwoFactor(true);
            toast.success('Check your email for 2FA code');
          }
        } else {
          throw new Error('Login data is undefined');
        }
      } catch (e) {
        console.error('Error with log in: ', e);
      }
    });
  };

  const handleSocialSignIn = (provider?: SignInProvider) => {
    signIn(provider, {
      callbackUrl: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
    });
  };

  return {
    form,
    isPending,
    showTwoFactor,
    onSubmit,
    handleSocialSignIn,
  };
};

export default useLoginForm;
