'use client';
import { ValidateInvite } from '@/actions/invites/validate.invites.actions';
import FormHeader from '@/components/form/FormHeader';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import AccountForm from '../../components/AccountForm';
import SocialLogin from '../../components/SocialLogin';
import useRegisterForm from '../../hooks/use-register-form';
import InviteCard from './invite-card';
import registerFields from './register-fields';

type FormRegisterProps = React.ComponentPropsWithoutRef<'form'> & {
  validInvite?: ValidateInvite;
};

const FormRegister = ({
  validInvite,
  className,
  ...props
}: FormRegisterProps) => {
  const {
    form,
    handleSubmit,
    isPending,
    onSubmit,
    hasEmail,
    invite,
    inviteMessage,
  } = useRegisterForm({
    validInvite,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          'flex w-full sm:w-4/5 md:w-full lg:w-4/5 flex-col space-y-4',
          className,
        )}
        {...props}
      >
        <FormHeader
          label="Register a new account"
          description="Welcome, we're happy to have you"
        />
        {validInvite && <InviteCard {...{ inviteMessage, invite }} />}
        <AccountForm accountFields={registerFields({ isPending, hasEmail })} />
        <SubmitButton label="Register a new account" isSubmitting={isPending} />
        <p className="text-sm text-muted-foreground col-span-full">
          Already have an account?{' '}
          <Link
            href="/account"
            className="font-semibold text-green-600 hover:underline"
          >
            Login here
          </Link>
        </p>
        <SocialLogin />
      </form>
    </Form>
  );
};

export default FormRegister;
