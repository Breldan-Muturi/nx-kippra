import { FormFieldType } from '@/types/form-field.types';
import { NewPasswordForm } from '@/validation/account/account.validation';

const passwordResetFields: FormFieldType<NewPasswordForm>[] = [
  {
    name: 'password',
    label: 'Password',
    placeholder: '******',
    type: 'password',
    description: 'Enter a strong secure password',
    className: 'col-span-2',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: '******',
    type: 'password',
    description: 'Repeat your password to confirm',
    className: 'col-span-2',
  },
];

export default passwordResetFields;
