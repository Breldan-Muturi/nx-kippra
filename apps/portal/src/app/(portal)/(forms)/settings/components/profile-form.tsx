'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import FormHeader from '@/components/form/FormHeader';
import { User } from '@prisma/client';
import { splitUserName } from '@/helpers/user.helper';
import { useTransition } from 'react';
import {
  ProfileActionParams,
  updateProfile,
} from '@/actions/account/profile.actions';
import { toast } from 'sonner';
import { useCurrentisOAuth } from '@/hooks/use-current-isoauth';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFields, accountFields } from './profile-fields';
import {
  ProfileUpdateForm,
  profileUpdateSchema,
} from '@/validation/profile/update.profile.validation';
import { useRouter } from 'next/navigation';

const ProfileForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const isOAuth = useCurrentisOAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onChange',
    defaultValues: (() => {
      const { password, name, ...fieldsUser } = user;
      const { firstName, lastName } = splitUserName(name);
      const userFields = Object.fromEntries(
        Object.entries(fieldsUser).filter(([_, value]) => value !== null),
      );
      return {
        ...userFields,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      };
    })(),
  });

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<ProfileUpdateForm> = (values) => {
    const { image, ...data } = values;
    let profileActionParams: ProfileActionParams;
    if (image instanceof File) {
      const formData = new FormData();
      formData.append('image', image);
      profileActionParams = { formData, data };
    } else {
      profileActionParams = { data: values };
    }
    startTransition(() => {
      updateProfile(profileActionParams)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          }
          if (data.success) {
            toast.success(data.success);
            router.refresh();
          }
        })
        .catch(() =>
          toast.error('Something went wrong, please try again later'),
        );
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid w-3/4 grid-cols-2 gap-2 space-y-3 self-center px-8 md:px-24"
      >
        <FormHeader
          label="Update"
          description="Your profile information"
          className="col-span-2 mb-2 mt-6"
        />
        <ReusableForm formFields={profileFields} />
        <FormHeader
          label="Account and security"
          description="Securely update your access settings and credentials"
          className="col-span-2 my-2"
        />
        <ReusableForm formFields={accountFields(isOAuth || false)} />
        <SubmitButton label="Update your Profile" isSubmitting={isPending} />
      </form>
    </Form>
  );
};

export default ProfileForm;
