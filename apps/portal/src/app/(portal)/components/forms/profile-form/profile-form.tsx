'use client';

import {
  ProfileActionParams,
  updateProfile,
} from '@/actions/account/profile.actions';
import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { UserById, splitUserName } from '@/helpers/user.helper';
import { useCurrentisOAuth } from '@/hooks/use-current-isoauth';
import {
  ProfileUpdateForm,
  profileUpdateSchema,
} from '@/validation/profile/profile.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { accountFields, profileFields } from './profile-fields';

const ProfileForm = ({ user }: { user: UserById }) => {
  const { update } = useSession();
  const router = useRouter();
  const isOAuth = useCurrentisOAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onChange',
    defaultValues: (() => {
      const { password, name, image, ...fieldsUser } = user;
      const { firstName, lastName } = splitUserName(name);
      const userFields = Object.fromEntries(
        Object.entries(fieldsUser).filter(([_, value]) => value !== null),
      );
      return {
        ...userFields,
        image: image?.fileUrl,
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
            update();
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
        className="grid self-center grid-cols-2 gap-2 px-2 lg:space-y-3 lg:w-3/4 md:px-24"
      >
        <FormHeader
          label="Update"
          description="Your profile information"
          className="col-span-2 mt-2 lg:mb-2 lg:mt-6"
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
