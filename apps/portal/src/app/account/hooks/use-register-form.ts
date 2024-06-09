import { register } from '@/actions/account/register.actions';
import {
  OrgInvite,
  ValidateInvite,
} from '@/actions/invites/validate.invites.actions';
import { TokenType } from '@/types/account.types';
import {
  RegisterForm,
  registerFormSchema,
  registerSchema,
} from '@/validation/account/account.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const useRegisterForm = ({ validInvite }: { validInvite?: ValidateInvite }) => {
  let tokenValues: TokenType | undefined,
    hasEmail: boolean = false,
    inviteMessage: string = '',
    invite: OrgInvite | undefined;

  const warning =
    'If you proceed with registration, your account will not be linked to any organization';
  if (validInvite && 'error' in validInvite)
    inviteMessage = `${validInvite.error}. ${warning}`;
  if (validInvite && 'invalid' in validInvite)
    inviteMessage = `No matching organization invite. ${warning}`;
  if (validInvite && 'invite' in validInvite) {
    const { invite: orgInvite } = validInvite;
    if (!orgInvite || orgInvite.expires < new Date()) {
      inviteMessage = `This invite is expired. ${warning}`;
    } else {
      invite = orgInvite;
      tokenValues = {
        orgInviteToken: orgInvite.token,
        email: orgInvite.email,
      };
      hasEmail = true;
      inviteMessage = `Welcome to the KIPPRA online registration portal. You are about to register a new account, and will be added as a member of ${orgInvite.organization.name}`;
    }
  }

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      ...Object.fromEntries(
        Object.entries(registerFormSchema.shape).map(([key]) => [key, '']),
      ),
      termsConditons: false,
      ...tokenValues,
    },
  });

  const { handleSubmit } = form;
  const onSubmit: SubmitHandler<RegisterForm> = (values) =>
    startTransition(() => {
      register(values)
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            router.push('/account');
          }
        })
        .catch(() =>
          toast.error('Something went wrong while registering this user'),
        );
    });

  return {
    form,
    handleSubmit,
    isPending,
    hasEmail,
    invite,
    inviteMessage,
    onSubmit,
  };
};

export default useRegisterForm;
