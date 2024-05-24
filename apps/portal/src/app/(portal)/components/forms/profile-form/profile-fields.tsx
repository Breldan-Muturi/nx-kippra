import {
  citizenshipOptions,
  identificationOptions,
} from '@/helpers/enum.helpers';
import { FormFieldType } from '@/types/form-field.types';
import {
  AccountForm,
  ProfileForm,
} from '@/validation/profile/profile.validation';

const profileFields: FormFieldType<ProfileForm>[] = [
  {
    name: 'image',
    type: 'singleImage',
    label: 'Update your profile image',
    description: 'Profile Photo',
    className: 'col-span-2 self-center',
  },
  {
    name: 'firstName',
    type: 'text',
    label: 'First Name',
    placeholder: 'eg. Anne',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'eg. Wanjiku',
    type: 'text',
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    placeholder: 'eg. 254711223344',
    type: 'tel',
  },
  {
    name: 'citizenship',
    type: 'select',
    label: 'Citizenship',
    placeholder: 'Select citizenship type',
    selectLabel: 'Citizenship options',
    options: citizenshipOptions,
  },
  {
    name: 'identification',
    type: 'select',
    label: 'Identification Type',
    placeholder: 'Select identification type',
    selectLabel: 'Identification Types',
    options: identificationOptions,
  },
  {
    name: 'nationalId',
    label: 'ID/Passport NO.',
    placeholder: 'National ID/Passport Number',
    type: 'text',
  },
  {
    name: 'occupation',
    label: 'Occupation',
    placeholder: 'Enter your occupation',
    type: 'text',
    className: 'col-span-2 lg:col-span-1',
  },
  {
    name: 'userOrganization',
    label: 'Organization',
    placeholder: 'Enter your organization',
    type: 'text',
    className: 'col-span-2 lg:col-span-1',
  },
  {
    name: 'county',
    type: 'text',
    label: 'County',
    placeholder: 'Enter your county',
    className: 'col-span-2 lg:col-span-1',
  },
  {
    name: 'address',
    label: 'Address',
    className: 'col-span-2',
    description: 'Enter either your personal address or organization address',
    placeholder: 'Enter your address',
    type: 'text',
  },
];

const accountFields = (isOAuth: boolean): FormFieldType<AccountForm>[] => [
  ...(isOAuth
    ? []
    : ([
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
          placeholder: 'Enter your current password',
          type: 'password',
          className: 'col-span-2 lg:col-span-1',
        },
        {
          name: 'newPassword',
          label: 'New Password',
          placeholder: 'Enter a new password',
          type: 'password',
          className: 'col-span-2 lg:col-span-1',
        },
      ] as FormFieldType<AccountForm>[])),
  {
    name: 'isTwoFactorEnabled',
    type: 'switch',
    label: 'Enable Two Factor Authentication',
    description:
      'With two factor authentication, you receive a verification token when you sign in again',
    className: 'col-span-2 bg-background',
  },
];

export { accountFields, profileFields };
