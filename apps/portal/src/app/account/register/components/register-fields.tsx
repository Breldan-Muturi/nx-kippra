import { FormFieldType } from '@/types/form-field.types';
import { RegisterForm } from '@/validation/account/account.validation';
import Link from 'next/link';

const registerFields = ({
  isPending: disabled,
  hasEmail,
}: {
  isPending: boolean;
  hasEmail: boolean;
}): FormFieldType<RegisterForm>[] => [
  {
    name: 'firstName',
    label: 'First name',
    placeholder: 'eg. Anne',
    disabled,
    className: 'col-span-full sm:col-span-1',
  },
  {
    name: 'lastName',
    label: 'Last name',
    placeholder: 'eg. Wanjiku',
    disabled,
    className: 'col-span-full sm:col-span-1',
  },
  // TODO: Add a utility for common fields.
  {
    name: 'email',
    label: 'Email',
    placeholder: 'eg. annewanjiku@email.com',
    type: 'email',
    className: 'col-span-full',
    disabled: disabled || hasEmail,
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter a strong password',
    type: 'password',
    disabled,
    className: 'col-span-full sm:col-span-1',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Repeat password to confirm',
    type: 'password',
    disabled,
    className: 'col-span-full sm:col-span-1',
  },
  {
    name: 'termsConditons',
    type: 'checkbox',
    className: 'items-start py-2',
    disabled,
    description: (
      <span className="text-sm text-muted-foreground col-span-full">
        I agree with KIPPRA's{' '}
        <Link
          href="https://kippra.or.ke"
          target="_blank"
          className="font-semibold text-green-600 hover:underline"
        >
          {"T&C's"}
        </Link>{' '}
        and{' '}
        <Link
          href="https://kippra.or.ke"
          target="_blank"
          className="font-semibold text-green-600 hover:underline"
        >
          Privacy policy
        </Link>
      </span>
    ),
  },
];

export default registerFields;
