'use client';
import FormHeader from '@/components/form/FormHeader';
import SubmitButton from '@/components/form/SubmitButton';
import { buttonVariants } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AccountForm from '../components/AccountForm';
import useNewPassword from '../hooks/use-new-password';
import passwordResetFields from './components/new-password-fields';

const NewPassword = () => {
  const { form, isPending, onSubmit } = useNewPassword();
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-4 sm:w-3/4 lg:w-1/2"
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
