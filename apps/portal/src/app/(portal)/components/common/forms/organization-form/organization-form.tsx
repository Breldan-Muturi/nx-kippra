'use client';

import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  NewOrganizationImageFileType,
  UpdateOrganizationForm,
  UpdateOrganizationImageFileType,
  newOrganizationImageFileSchema,
  updateOrganizationImageFileSchema,
} from '@/validation/organization/organization.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { organizationFields } from './organization-fields';
import SubmitButton from '@/components/form/SubmitButton';
import {
  UserNewOrganizationParams,
  userNewOrganization,
} from '@/actions/organization/create.organization.actions';
import { toast } from 'sonner';
import { Organization } from '@prisma/client';
import {
  UpdateOrganizationType,
  updateOrganization,
} from '@/actions/organization/update.organization.actions';

type OrganizationFormProps = React.ComponentPropsWithoutRef<'form'> & {
  organization?: Organization;
};

const OrganizationForm = ({
  organization,
  className,
  ...props
}: OrganizationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<
    NewOrganizationImageFileType | UpdateOrganizationImageFileType
  >({
    resolver: zodResolver(
      !!organization
        ? updateOrganizationImageFileSchema
        : newOrganizationImageFileSchema,
    ),
    mode: 'onChange',
    defaultValues: !!organization
      ? (() => {
          const organizationInfo = Object.fromEntries(
            Object.entries(organization).filter(([_, value]) => value !== null),
          );
          return {
            ...organizationInfo,
            organizationAddress: organization.address,
            organizationEmail: organization.email,
            organizationPhone: organization.phone,
          };
        })()
      : {},
  });

  const { handleSubmit } = form;

  const onSubmit = (
    organizationInput:
      | NewOrganizationImageFileType
      | UpdateOrganizationImageFileType,
  ) => {
    const { image, ...organization } = organizationInput;
    let newOrg: UserNewOrganizationParams | undefined;
    let updateOrg: UpdateOrganizationType | undefined;

    if (image instanceof File) {
      const formData = new FormData();
      formData.append('image', image);
      if (!!organization) {
        updateOrg = { formData, data: organization as UpdateOrganizationForm };
      } else {
        newOrg = { formData, organization };
      }
    } else {
      updateOrg = { data: organization as UpdateOrganizationImageFileType };
    }

    startTransition(() => {
      if (!!newOrg) {
        userNewOrganization(newOrg).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            router.push(`/organization/${data.recordId}`);
          }
        });
      } else if (!!updateOrg) {
        updateOrganization(updateOrg).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            router.refresh();
          }
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          'grid grid-cols-2 w-full  gap-x-4 gap-y-2 self-center p-8 md:w-3/4',
          className,
        )}
        {...props}
      >
        <FormHeader
          label={!!organization ? 'Update organization' : 'New Organization'}
          description={`Submit the form below to ${!!organization ? 'update this organization' : 'add a new organization'}`}
          className="col-span-2"
        />
        <ReusableForm formFields={organizationFields} />
        <SubmitButton
          label={
            !!organization ? 'Update organization' : 'Add New Organization'
          }
          isSubmitting={isPending}
          className="my-8 w-full"
        />
      </form>
    </Form>
  );
};

export default OrganizationForm;
