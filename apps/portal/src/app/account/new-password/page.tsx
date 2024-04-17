'use client';
import FormHeader from '@/components/form/FormHeader';
import SubmitButton from '@/components/form/SubmitButton';
import { buttonVariants } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { newPassword } from '@/actions/account/new-password.actions';
import { FormFieldType } from '@/types/form-field.types';
import { cn } from '@/lib/utils';
import {
  NewPasswordForm,
  newPasswordSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AccountForm from '../components/AccountForm';

const passwordResetFields: FormFieldType<NewPasswordForm>[] = [
  {
    name: 'password',
    label: 'Password',
    placeholder: '******',
    type: 'password',
    description: 'Enter a strong secure password',
    className: 'col-span-2',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: '******',
    type: 'password',
    description: 'Repeat your password to confirm',
    className: 'col-span-2',
  },
];

const NewPassword = () => {
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
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col space-y-4 md:w-1/2"
      >
        <FormHeader
          label="Reset your password"
          description="Enter and confirm your new & secure password"
        />
        <AccountForm accountFields={passwordResetFields} />
        <SubmitButton label="Reset your password" isSubmitting={isPending} />
        <Link
          href="/account"
          className={cn(
            buttonVariants({ variant: 'link' }),
            'h-4 justify-start p-0 text-sm font-semibold text-green-600',
          )}
        >
          Back to Login
        </Link>
      </form>
    </Form>
  );
};

export default NewPassword;
