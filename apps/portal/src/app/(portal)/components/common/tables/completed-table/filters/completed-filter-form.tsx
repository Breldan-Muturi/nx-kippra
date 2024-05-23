'use client';
import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  FilterCompletedSchema,
  filterCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';

type CompletedFilterProps = React.ComponentPropsWithoutRef<'div'> & {
  isPending: boolean;
  filterValues: FilterCompletedSchema;
  customSubmit: SubmitHandler<FilterCompletedSchema>;
  filterForm: FormFieldType<FilterCompletedSchema>[];
  clearFilters: () => void;
};

const CompletedFilter = ({
  isPending,
  filterValues,
  customSubmit,
  filterForm,
  clearFilters,
  className,
  ...props
}: CompletedFilterProps) => {
  const form = useForm<FilterCompletedSchema>({
    resolver: zodResolver(filterCompletedSchema),
    defaultValues: filterValues,
    mode: 'onChange',
  });
  const { handleSubmit, watch, reset } = form;
  const isAnyFieldFilled = Object.values(watch()).some(
    (value) => !!value && value !== '',
  );

  const onClear = () => {
    reset();
    clearFilters();
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col py-2 space-y-2"
        onSubmit={handleSubmit(customSubmit)}
      >
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-y-3 md:grid-cols-2 md:gap-x-3 lg:grid-cols-4 lg:items-start',
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
                <Loader2 color="white" className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 color="white" />
              )}
              Apply filter
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

export default CompletedFilter;
