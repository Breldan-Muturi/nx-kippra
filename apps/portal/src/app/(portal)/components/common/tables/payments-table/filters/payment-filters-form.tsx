import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  FilterPaymentsType,
  filterPaymentsSchema,
} from '@/validation/payment/payment.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type PaymentTableFiltersProps = React.ComponentPropsWithoutRef<'div'> & {
  filterValues: FilterPaymentsType;
  filterForm: FormFieldType<FilterPaymentsType>[];
  customSubmit: SubmitHandler<FilterPaymentsType>;
  isPending: boolean;
  clearFilters: () => void;
};

const PaymentTableFilters = ({
  filterValues,
  filterForm,
  customSubmit,
  isPending,
  clearFilters,
  className,
  ...props
}: PaymentTableFiltersProps) => {
  const form = useForm<FilterPaymentsType>({
    resolver: zodResolver(filterPaymentsSchema),
    defaultValues: filterValues,
    mode: 'onChange',
  });
  const { watch, reset, handleSubmit } = form;

  const isAnyFieldFilled = () => {
    return Object.values(watch()).some(
      (value) => value !== '' && value !== null && !!value,
    );
  };

  const onClear = () => {
    // To Do: Improve clearing filters on this for the select fields
    reset({
      invoiceNumber: '',
      method: '',
      payeeName: '',
      programTitle: '',
      status: '',
    });
    clearFilters();
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col space-y-2 py-2"
        onSubmit={handleSubmit(customSubmit)}
      >
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-y-3 md:grid-cols-2 md:gap-x-3 lg:grid-cols-5 lg:items-start',
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

export default PaymentTableFilters;
