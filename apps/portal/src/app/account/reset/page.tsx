'use client';
import FormHeader from '@/components/form/FormHeader';
import SubmitButton from '@/components/form/SubmitButton';
import { buttonVariants } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import { EmailValidationType } from '@/validation/account/account.validation';
import Link from 'next/link';
import AccountForm from '../components/AccountForm';
import useResetPassword from '../hooks/use-reset-password';

const resetFields: FormFieldType<EmailValidationType>[] = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'Enter your account email',
    type: 'email',
    className: 'col-span-2',
  },
];

const ResetPage = () => {
  const { form, isPending, onSubmit } = useResetPassword();
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-4 sm:w-3/5 lg:w-1/2"
      >
        <FormHeader
          label="Enter your email"
          description="To initiate a password reset & regain access to your account"
        />
        <AccountForm accountFields={resetFields} />
        <SubmitButton label="Send reset email" isSubmitting={isPending} />
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

export default ResetPage;
