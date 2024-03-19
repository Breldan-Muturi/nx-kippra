"use client";

import { FormFieldType, SelectOptions } from "@/types/form-field.types";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ReusableForm from "@/components/form/ReusableForm";
import SubmitButton from "@/components/form/SubmitButton";
import FormHeader from "@/components/form/FormHeader";
import {
  AccountForm,
  UpdateProfileForm,
  UserSettingsForm,
  userSettingsSchema,
} from "@/validation/profile.validation";
import { Citizenship, Identification, User } from "@prisma/client";
import {
  formatCitizenship,
  formatIdentification,
} from "@/helpers/enum.helpers";
import { splitUserName } from "@/helpers/user.helper";
import { useTransition } from "react";
import { updateProfile } from "@/actions/account/profile.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCurrentisOAuth } from "@/hooks/use-current-isoauth";
import { zodResolver } from "@hookform/resolvers/zod";

const citizenshipOptions: SelectOptions[] = Object.values(Citizenship).map(
  (type) => ({
    value: type,
    optionLabel: formatCitizenship(type),
  }),
);

const identificationOptions: SelectOptions[] = Object.values(
  Identification,
).map((type) => ({
  value: type,
  optionLabel: formatIdentification(type),
}));

const profileFields: FormFieldType<UpdateProfileForm>[] = [
  {
    name: "image",
    type: "file",
    label: "Update your profile image",
    description: "Profile Photo",
    endpoint: "serverImage",
    className: "col-span-2 self-center",
  },
  {
    name: "firstName",
    type: "text",
    label: "First Name",
    placeholder: "eg. Anne",
  },
  {
    name: "lastName",
    label: "Last Name",
    placeholder: "eg. Wanjiku",
    type: "text",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    placeholder: "eg. 254711223344",
    type: "number",
  },
  {
    name: "citizenship",
    type: "select",
    label: "Citizenship",
    placeholder: "Select citizenship type",
    selectLabel: "Citizenship options",
    options: citizenshipOptions,
  },
  {
    name: "identification",
    type: "select",
    label: "Identification Type",
    placeholder: "Select identification type",
    selectLabel: "Identification Types",
    options: identificationOptions,
  },
  {
    name: "nationalId",
    label: "ID/Passport NO.",
    placeholder: "National ID/Passport Number",
    type: "number",
  },
  {
    name: "occupation",
    label: "Occupation",
    placeholder: "Enter your occupation",
    type: "text",
  },
  {
    name: "userOrganization",
    label: "Organization",
    placeholder: "Enter your organization",
    type: "text",
  },
  {
    name: "county",
    type: "text",
    label: "County",
    placeholder: "Enter your county",
  },
  {
    name: "address",
    label: "Address",
    className: "col-span-2",
    description: "Enter either your personal address or organization address",
    placeholder: "Enter your address",
    type: "text",
  },
];

const accountFields = (isOAuth: boolean): FormFieldType<AccountForm>[] => {
  const commonField: FormFieldType<AccountForm> = {
    name: "isTwoFactorEnabled",
    type: "switch",
    label: "Enable Two Factor Authentication",
    description:
      "With two factor authentication, you receive a verification token when you sign in again",
    className: "col-span-2 bg-background",
  };

  const notOAuthFields: FormFieldType<AccountForm>[] = [
    {
      name: "email",
      placeholder: "Enter your email address",
      label: "Email",
      type: "email",
      className: "col-span-2",
    },
    {
      name: "password",
      label: "Password",
      placeholder: "Enter your current password",
      type: "password",
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Enter a new password",
      type: "password",
    },
    commonField,
  ];
  return isOAuth ? [commonField] : notOAuthFields;
};

const ProfileForm = ({ user }: { user: User }) => {
  const { update } = useSession();
  const isOAuth = useCurrentisOAuth();
  const [isPending, startTransition] = useTransition();
  const { firstName, lastName } = splitUserName(user.name);
  const form = useForm<UserSettingsForm>({
    resolver: zodResolver(userSettingsSchema),
    mode: "onChange",
    defaultValues: {
      id: user.id,
      image: user?.image ?? undefined,
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      phoneNumber: user?.phoneNumber ?? undefined,
      nationalId: user?.nationalId ?? undefined,
      occupation: user?.occupation ?? undefined,
      citizenship: user?.citizenship ?? undefined,
      identification: user?.identification ?? undefined,
      userOrganization: user?.userOrganization ?? undefined,
      address: user?.address ?? undefined,
      county: user?.county ?? undefined,
      email: isOAuth ? undefined : user.email ?? undefined,
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    },
  });

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<UserSettingsForm> = (data) => {
    startTransition(() => {
      updateProfile(data)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          }
          if (data.success) {
            update();
            toast.success(data.success);
          }
        })
        .catch(() =>
          toast.error("Something went wrong, please try again later"),
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
          className="col-span-2 mb-2 mt-12"
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
