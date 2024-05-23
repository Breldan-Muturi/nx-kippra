'use client';
import { login } from '@/actions/account/login.actions';
import SocialLogin from '@/app/account/components/SocialLogin';
import ComposableDescription from '@/components/form/ComposableDescription';
import FormHeader from '@/components/form/FormHeader';
import SubmitButton from '@/components/form/SubmitButton';
import { buttonVariants } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  LoginForm,
  loginSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AccountForm from '../components/AccountForm';

const loginFields: FormFieldType<LoginForm>[] = [
  {
    name: 'email',
    placeholder: 'Enter your email address',
    label: 'Email',
    type: 'email',
    className: 'col-span-2',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    className: 'col-span-2',
    description: (
      <ComposableDescription label="Forgot your password">
        <Link
          href="/account/reset"
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Reset it here
        </Link>
      </ComposableDescription>
    ),
  },
  {
    name: 'code',
    label: 'Two Factor Code',
    type: 'number',
    placeholder: '123456',
    className: 'col-span-2',
    description: 'Check for 2FA code in your email',
  },
];

const LoginPage = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [isPending, startTransition] = useTransition();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const filteredLoginFields = showTwoFactor
    ? loginFields.filter((field) => field.name === 'code')
    : loginFields.filter((field) => field.name !== 'code');

  const submitLabel = showTwoFactor
    ? 'Confirm to Login'
    : 'Log in to your account';

  const onSubmit: SubmitHandler<LoginForm> = (values) => {
    // Start the transition so that we can show a loading state while submitting
    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (data?.error) {
            form.reset();
            toast.error(data.error);
          }
          if (data?.success) {
            form.reset();
            toast.success(data.success);
          }
          if (data?.twoFactor) {
            setShowTwoFactor(data.twoFactor);
            toast.success('Check your email for 2FA code');
          }
        })
        .catch(() =>
          toast.error('Something went wrong. Please try again later.'),
        );
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-[95%] flex-col space-y-4 md:w-3/5"
      >
        <FormHeader
          label="Glad to see you again"
          description="Login to your account"
        />
        <AccountForm accountFields={filteredLoginFields} />
        <SubmitButton label={submitLabel} isSubmitting={isPending} />
        {showTwoFactor ? (
          <Link
            href="/account"
            className={cn(
              buttonVariants({ variant: 'link' }),
              'h-4 justify-start p-0 text-sm font-semibold text-green-600',
            )}
          >
            Login to resend 2FA code
          </Link>
        ) : (
          <p className="flex items-center justify-center col-span-2">
            <ComposableDescription label="Don't have an account">
              <Link
                href="/account/register"
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                Register one here
              </Link>
            </ComposableDescription>
          </p>
        )}
        <SocialLogin />
      </form>
    </Form>
  );
};

export default LoginPage;
