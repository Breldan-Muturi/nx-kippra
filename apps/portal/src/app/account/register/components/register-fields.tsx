import ComposableDescription from '@/components/form/ComposableDescription';
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
  },
  {
    name: 'lastName',
    label: 'Last name',
    placeholder: 'eg. Wanjiku',
    disabled,
  },
  // TODO: Add a utility for common fields.
  {
    name: 'email',
    label: 'Email',
    placeholder: 'eg. annewanjiku@email.com',
    type: 'email',
    className: 'col-span-2',
    disabled: disabled || hasEmail,
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter a strong password',
    type: 'password',
    disabled,
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Repeat password to confirm',
    type: 'password',
    disabled,
  },
  {
    name: 'termsConditons',
    type: 'checkbox',
    className: 'items-start py-2',
    disabled,
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

export default registerFields;
