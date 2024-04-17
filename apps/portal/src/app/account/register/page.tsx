'use client';
import ComposableDescription from '@/components/form/ComposableDescription';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { register } from '@/actions/account/register.actions';
import { FormFieldType } from '@/types/form-field.types';
import {
  RegisterForm,
  registerSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import SocialLogin from '../components/SocialLogin';
import FormHeader from '@/components/form/FormHeader';
import AccountForm from '../components/AccountForm';

const registerFields: FormFieldType<RegisterForm>[] = [
  {
    name: 'firstName',
    label: 'First name',
    placeholder: 'eg. Anne',
  },
  {
    name: 'lastName',
    label: 'Last name',
    placeholder: 'eg. Wanjiku',
  },
  // To Do: Add a utility for common fields.
  {
    name: 'email',
    label: 'Email',
    placeholder: 'eg. annewanjiku@email.com',
    type: 'email',
    className: 'col-span-2',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter a strong password',
    type: 'password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Repeat password to confirm',
    type: 'password',
  },
  {
    name: 'termsConditons',
    type: 'checkbox',
    className: 'items-start py-2',
    description: (
      <ComposableDescription label="I agree with KIPPRA's">
        <Link
          href="https://kippra.or.ke"
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          {"T&C's"}
        </Link>
        &nbsp;and&nbsp;
        <Link
          href="https://kippra.or.ke"
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Privacy policy
        </Link>
      </ComposableDescription>
    ),
  },
];

const RegisterPage = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsConditons: false,
    },
  });

  const onSubmit: SubmitHandler<RegisterForm> = (values) => {
    startTransition(() => {
      register(values).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
        }
      });
    });
  };

  const { handleSubmit } = form;

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-4/5 flex-col space-y-4"
      >
        <FormHeader
          label="Enter your details below"
          description="Create your account to get started"
        />
        <AccountForm accountFields={registerFields} />
        <SubmitButton label="Register a new account" isSubmitting={isPending} />
        <p className="col-span-2 flex items-center justify-center">
          <ComposableDescription label="Already have an account?">
            <Link
              href="/account"
              className="text-sm font-semibold text-green-600 hover:underline"
            >
              Login here
            </Link>
          </ComposableDescription>
        </p>
        <SocialLogin />
      </form>
    </Form>
  );
};

export default RegisterPage;
