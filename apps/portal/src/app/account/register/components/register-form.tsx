'use client';
import FormHeader from '@/components/form/FormHeader';
import { Form } from '@/components/ui/form';
import {
  RegisterForm,
  registerSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import AccountForm from '../../components/AccountForm';
import SubmitButton from '@/components/form/SubmitButton';
import ComposableDescription from '@/components/form/ComposableDescription';
import { toast } from 'sonner';
import { register } from '@/actions/account/register.actions';
import Link from 'next/link';
import SocialLogin from '../../components/SocialLogin';
import { useRouter } from 'next/navigation';
import registerFields from './register-fields';
import { ValidateInvite } from '@/actions/invites/validate.invites.actions';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquareWarning } from 'lucide-react';
import { avatarFallbackName } from '@/helpers/user.helper';

type FormRegisterProps = React.ComponentPropsWithoutRef<'form'> & {
  validInvite?: ValidateInvite;
};

const FormRegister = ({
  validInvite,
  className,
  ...props
}: FormRegisterProps) => {
  const warning =
    'If you proceed with registration, your account will not be linked to any organization';
  const isErrorInvite = validInvite && 'error' in validInvite;
  const isInvalidInvite = validInvite && 'invalid' in validInvite;
  const isInviteValid = validInvite && 'invite' in validInvite;

  let inviteMessage: string = '';
  if (isErrorInvite) inviteMessage = `${validInvite.error}. ${warning}`;
  if (isInvalidInvite)
    inviteMessage = `There is no matching organization invite. ${warning}`;

  let tokenValues: Pick<RegisterForm, 'orgInviteToken' | 'email'> | undefined;
  let hasEmail: boolean = false;
  if (isInviteValid) {
    if ((validInvite.invite?.expires as Date) < new Date()) {
      inviteMessage = `This invite is expired. ${warning}`;
    } else {
      tokenValues = {
        orgInviteToken: validInvite.invite?.token,
        email: validInvite.invite?.email as string,
      };
      hasEmail = true;
      inviteMessage = `Welcome to the KIPPRA online registration portal. You are about to register a new account, and will be added as a member of ${validInvite.invite?.organization.name}`;
    }
  }

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ...tokenValues,
      termsConditons: false,
    },
  });
  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<RegisterForm> = (values) =>
    startTransition(() => {
      register(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            toast.success(data.success);
            router.push('/account');
          }
        })
        .catch(() =>
          toast.error('Something went wrong while registering this user'),
        );
    });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('flex w-4/5 flex-col space-y-4', className)}
        {...props}
      >
        <FormHeader
          label="Enter your details below"
          description="Create your account to get started"
        />
        {validInvite && (
          <div
            className={cn(
              'flex p-4 items-center rounded-lg border-2 space-x-4',
              isInviteValid ? 'border-muted-background' : 'border-red-600/20',
            )}
          >
            {isInviteValid ? (
              <Avatar className="size-16 ring-4 ring-green-600/60">
                <AvatarImage
                  src={validInvite.invite?.organization.image || undefined}
                  alt={`${validInvite.invite?.organization.name}'s profile image`}
                />
                <AvatarFallback className="text-lg">
                  {validInvite.invite?.organization.name
                    ? avatarFallbackName(validInvite.invite?.organization.name)
                    : 'NA'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <MessageSquareWarning
                size={50}
                color="red"
                fill="red"
                fillOpacity={0.2}
              />
            )}
            <p
              className={cn(
                'font-semibold',
                isInviteValid ? 'text-muted-foreground' : 'text-red-600/60',
              )}
            >
              {inviteMessage}
            </p>
          </div>
        )}
        <AccountForm accountFields={registerFields({ isPending, hasEmail })} />
        <SubmitButton label="Register a new account" isSubmitting={isPending} />
        <p className="flex items-center justify-center col-span-2">
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

export default FormRegister;
