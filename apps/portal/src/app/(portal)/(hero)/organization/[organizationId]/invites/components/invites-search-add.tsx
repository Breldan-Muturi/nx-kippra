import TooltipIconButton from '@/components/buttons/tooltip-icon-button';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  FilterInvitesSchema,
  filterInvitesSchema,
} from '@/validation/organization/organization.invites.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

const searchInvites: FormFieldType<FilterInvitesSchema>[] = [
  {
    name: 'email',
    type: 'email',
    label: `Enter invite's email`,
    placeholder: 'eg. invite@email.com',
    className: 'w-full md:flex-grow md:mr-2',
    description: 'Search or add a new invite',
  },
];

type InviteSearchAddProps = React.ComponentPropsWithoutRef<'form'> & {
  onSubmit: SubmitHandler<FilterInvitesSchema>;
  defaultValues?: FilterInvitesSchema;
  isPending: boolean;
  clearForm: () => void;
};

const InvitesSearchAdd = ({
  onSubmit,
  defaultValues,
  isPending,
  clearForm,
  className,
  ...props
}: InviteSearchAddProps) => {
  const form = useForm<FilterInvitesSchema>({
    resolver: zodResolver(filterInvitesSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, reset } = form;

  const onClear = () => {
    reset({
      email: undefined,
    });
    if (defaultValues) clearForm();
  };

  const submitForm = (data: FilterInvitesSchema) => {
    onSubmit(data);
    reset({ email: '' });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(submitForm)}
        className={cn(
          'flex flex-col md:flex-row w-full justify-start items-start md:items-center md:space-x-2',
          className,
        )}
        {...props}
      >
        <ReusableForm formFields={searchInvites} />
        <div className="flex items-center space-x-2">
          <SubmitButton
            label="Search or add invite"
            isSubmitting={isPending}
            className="mt-1"
          />
          <TooltipIconButton
            icon={<X className="size-6" />}
            type="button"
            tooltipLabel="Clear email field"
            className="mt-1 bg-red-600/80 hover:bg-red-600 size-8"
            onClick={onClear}
          />
        </div>
      </form>
    </Form>
  );
};

export default InvitesSearchAdd;
