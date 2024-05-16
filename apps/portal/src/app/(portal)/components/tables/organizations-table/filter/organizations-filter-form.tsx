'use client';
import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  FilterOrganizationsType,
  filterOrganizationsSchema,
} from '@/validation/organization/organization.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type OrganizationFilterFormProps = React.ComponentPropsWithoutRef<'div'> & {
  isPending: boolean;
  filterForm: FormFieldType<FilterOrganizationsType>[];
  filterValues: FilterOrganizationsType;
  customSubmit: SubmitHandler<FilterOrganizationsType>;
  clearFilters: () => void;
};

const OrganizationFilterForm = ({
  isPending,
  filterForm,
  filterValues,
  customSubmit,
  clearFilters,
  className,
  ...props
}: OrganizationFilterFormProps) => {
  const form = useForm<FilterOrganizationsType>({
    resolver: zodResolver(filterOrganizationsSchema),
    defaultValues: filterValues,
    mode: 'onChange',
  });

  const { handleSubmit, reset, watch } = form;

  const onClear = () => {
    reset({
      address: '',
      contactEmail: '',
      county: '',
      name: '',
      role: undefined,
    });
    clearFilters();
  };

  const isAnyFieldFilled = Object.values(watch()).some(
    (value) => value && value !== '',
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col py-2 space-y-2"
        onSubmit={handleSubmit(customSubmit)}
      >
        <div
          className={cn(
            'grid w-full grid-cols-1 items-center gap-y-3 md:grid-cols-2 md:gap-x-3 lg:grid-cols-5 lg:items-start',
            className,
          )}
          {...props}
        >
          <ReusableForm formFields={filterForm} />
        </div>
        {isAnyFieldFilled && (
          <div className="flex items-center gap-x-3">
            <Button
              type="submit"
              variant="default"
              className="bg-green-600 gap-x-3 hover:bg-green-800"
            >
              {isPending ? (
                <Loader2 color="white" className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle2 color="white" />
              )}
              Apply Filter
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-red-600 gap-x-3"
              onClick={onClear}
            >
              <Trash2 color="red" size={20} />
              Clear
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default OrganizationFilterForm;
