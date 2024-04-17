'use client';
import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  FilterParticipantsType,
  filterParticipantsSchema,
} from '@/validation/participants/participants.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';

type ParticipantsFilterFormProps = React.ComponentPropsWithRef<'div'> & {
  isPending: boolean;
  filterValues: FilterParticipantsType;
  customSubmit: SubmitHandler<FilterParticipantsType>;
  filterForm: FormFieldType<FilterParticipantsType>[];
  clearFilters: () => void;
};

const ParticipantsFilterForm = ({
  isPending,
  filterValues,
  customSubmit,
  filterForm,
  clearFilters,
  className,
  ...props
}: ParticipantsFilterFormProps) => {
  const form = useForm<FilterParticipantsType>({
    resolver: zodResolver(filterParticipantsSchema),
    defaultValues: filterValues,
    mode: 'onChange',
  });
  const { handleSubmit, watch, reset } = form;

  const isAnyFieldFilled = () => {
    return Object.values(watch()).some((value) => value && value !== '');
  };

  const onClear = () => {
    reset({
      organizationName: '',
      role: undefined,
      participantEmail: '',
      participantName: '',
      programTitle: '',
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
            'grid w-full grid-cols-1 items-center gap-y-3 md:grid-cols-2 md:gap-x-3 lg:grid-cols-5 lg:items-start',
            className,
          )}
          {...props}
        >
          <ReusableForm formFields={filterForm} />
          {isAnyFieldFilled() && (
            <div className="flex items-center gap-x-3">
              <Button
                type="submit"
                variant="default"
                className="gap-x-3 bg-green-600 hover:bg-green-800"
              >
                {isPending ? (
                  <Loader2
                    color="white"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
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
        </div>
      </form>
    </Form>
  );
};

export default ParticipantsFilterForm;
