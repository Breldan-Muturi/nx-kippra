'use client';
import SocialLogin from '@/app/account/components/SocialLogin';
import FormHeader from '@/components/form/FormHeader';
import SubmitButton from '@/components/form/SubmitButton';
import { buttonVariants } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AccountForm from '../components/AccountForm';
import useLoginForm from '../hooks/use-login-form';
import loginFields from './components/login-fields';

const LoginPage = () => {
  const { form, isPending, showTwoFactor, onSubmit } = useLoginForm();
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-[95%] flex-col space-y-4 lg:w-3/5"
      >
        <FormHeader label="Login" description="Glad to see you back" />
        <AccountForm accountFields={loginFields(showTwoFactor)} />
        <SubmitButton
          label={showTwoFactor ? 'Confirm to Login' : 'Log in to your account'}
          isSubmitting={isPending}
        />
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
          <p className="text-sm text-muted-foreground col-span-full">
            Don't have an account?{' '}
            <Link
              href="/account/register"
              className="font-semibold text-green-600 hover:underline"
            >
              Register one here
            </Link>
          </p>
        )}
        <SocialLogin />
      </form>
    </Form>
  );
};

export default LoginPage;
