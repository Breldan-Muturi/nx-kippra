'use client';

import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import { ExtendedUser } from '@/types/next-auth';
import {
  FilterSessionsSchema,
  ViewSessionsSchema,
  filterSessionsSchema,
  formSessionsSchema,
} from '@/validation/training-session/fetch.sessions.validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';

type TrainingSessionFiltersProps = React.ComponentPropsWithoutRef<'div'> & {
  values: ViewSessionsSchema;
  customSubmit: SubmitHandler<FilterSessionsSchema>;
  filterForm: FormFieldType<FilterSessionsSchema>[];
  isPending: boolean;
  clearFilters: () => void;
  updateViews: (isShowPast: 'true' | 'false') => void;
  newSession: (programId: string) => void;
  programId?: string;
  user?: ExtendedUser;
};
const TrainingSessionFilters = ({
  values,
  customSubmit,
  filterForm,
  isPending,
  clearFilters,
  updateViews,
  newSession,
  programId,
  user,
  className,
  ...props
}: TrainingSessionFiltersProps) => {
  const isAdmin = user?.role === UserRole.ADMIN;
  const { showPast, ...filterFormValues } = values;
  const defaultValues = filterSessionsSchema.parse(filterFormValues);
  const form = useForm<FilterSessionsSchema>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(formSessionsSchema),
  });

  const { watch, reset, handleSubmit } = form;
  const pastShows = showPast === 'true';

  const isAnyFieldFilled = () => {
    return Object.values(watch()).some(
      (value) => value !== null && value !== '' && value,
    );
  };

  const onClear = () => {
    reset({
      programTitle: '',
      mode: undefined,
      endDate: undefined,
      venue: undefined,
      startDate: undefined,
    });
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
            // 'flex flex-col md:grid md:grid-cols-2 lg:flex-row items-center gap-y-3 gap-x-2 mb-1 lg:mb-0',
            'flex flex-col lg:flex-row items-center gap-y-3 gap-x-2 mb-1 lg:mb-0',
            className,
          )}
          {...props}
        >
          <ReusableForm formFields={filterForm} />
        </div>
        <div className="flex flex-col items-start justify-between w-full space-y-3 lg:space-y-0 lg:items-center lg:flex-auto">
          {isAnyFieldFilled() && (
            <div className="flex items-center gap-x-3">
              <SubmitButton isSubmitting={isPending} label="Apply filter" />
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
          <div className="flex items-center w-full lg:w-auto lg:ml-auto">
            <Button
              disabled={isPending || !pastShows}
              variant={pastShows ? 'secondary' : 'outline'}
              className="w-full rounded-r-none disabled:text-green-600 disabled:opacity-100 lg:w-auto"
              onClick={() => updateViews('false')}
            >
              Upcoming sessions
            </Button>
            <Button
              disabled={isPending || pastShows}
              variant={!pastShows ? 'secondary' : 'outline'}
              className="w-full rounded-l-none disabled:text-green-600 disabled:opacity-100 lg:w-auto"
              onClick={() => updateViews('true')}
            >
              Past sessions
            </Button>
            {programId && isAdmin && (
              <Button
                className="ml-3 bg-green-600 hover:bg-green-500"
                onClick={() => newSession(programId)}
                disabled={isPending || !programId}
              >
                Add training session
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default TrainingSessionFilters;
