'use client';
import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  FilterApplicationType,
  FilterPaginateAppliationType,
  filterPaginateApplicationSchema,
} from '@/validation/applications/user.application.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type ApplicationFilterProps = React.ComponentPropsWithoutRef<'div'> & {
  filterValues: FilterPaginateAppliationType;
  filterForm: FormFieldType<FilterApplicationType>[];
  customSubmit: SubmitHandler<FilterPaginateAppliationType>;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
};

const ApplicationsFilter = ({
  filterValues,
  filterForm,
  customSubmit,
  isPending,
  startTransition,
  className,
  ...props
}: ApplicationFilterProps) => {
  const { path, page, pageSize, ...filterParams } = filterValues;
  const router = useRouter();

  const form = useForm<FilterPaginateAppliationType>({
    resolver: zodResolver(filterPaginateApplicationSchema),
    defaultValues: { path, page: '1', pageSize, ...filterParams },
    mode: 'onChange',
  });

  const { watch, reset, handleSubmit } = form;
  const isAnyFieldFilled = () => {
    const { page, pageSize, path, hiddenColumns, ...filterFields } = watch();
    return Object.values(filterFields).some(
      (value) => value !== null && value !== '' && value,
    );
  };

  const onClear = () => {
    reset({
      status: undefined,
      type: undefined,
      applicantName: '',
      organizationName: '',
      programTitle: '',
    });
    startTransition(() => {
      const searchParams = new URLSearchParams({
        page: '1',
        pageSize,
      });
      const clearPath = `${path}?${searchParams.toString()}`;
      router.push(clearPath, { scroll: false });
    });
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col space-y-2 py-2"
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
        {isAnyFieldFilled() && (
          <div className="flex items-center gap-x-3">
            <Button
              type="submit"
              variant="default"
              className="gap-x-3 bg-green-600 hover:bg-green-800"
            >
              {isPending ? (
                <Loader2 color="white" className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 color="white" />
              )}
              Apply filter
            </Button>
            <Button
              type="button"
              variant="link"
              className="gap-x-3 text-red-600"
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

export default ApplicationsFilter;
