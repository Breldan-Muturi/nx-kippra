import { FormFieldType } from '@/types/form-field.types';
import { LoginForm } from '@/validation/account/account.validation';
import Link from 'next/link';

const loginFields = (showTwoFactor: boolean): FormFieldType<LoginForm>[] => [
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
      <span className="text-sm text-muted-foreground col-span-full">
        Forgot your password?{' '}
        <Link
          href="/account/reset"
          className="font-semibold text-green-600 hover:underline"
        >
          Reset it here
        </Link>
      </span>
    ),
  },
  ...(showTwoFactor
    ? ([
        {
          name: 'code',
          label: 'Two Factor Code',
          type: 'number',
          placeholder: '123456',
          className: 'col-span-2',
          description: 'Check for 2FA code in your email',
        },
      ] as FormFieldType<LoginForm>[])
    : []),
];

export default loginFields;
