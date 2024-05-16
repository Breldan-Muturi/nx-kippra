'use client';
import {
  NewProgramType,
  newProgram,
} from '@/actions/programmes/new.programs.actions';
import { SingleProgramReturn } from '@/actions/programmes/single.program.actions';
import {
  UpdateProgramType,
  updateProgram,
} from '@/actions/programmes/update.programs.action';
import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { SelectOptions } from '@/types/form-field.types';
import {
  NewProgramImageFileType,
  UpdateProgramImageFileType,
  newProgramImageFileSchema,
  updateProgramImageFileSchema,
} from '@/validation/programs/program.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import programFields from './program-form-fields';

type ProgramFormProps = React.ComponentPropsWithoutRef<'form'> & {
  programOptions?: SelectOptions[];
  moodleCourseOptions?: SelectOptions[];
  program?: SingleProgramReturn;
};

const ProgramForm = ({
  programOptions,
  moodleCourseOptions,
  program,
  className,
  ...props
}: ProgramFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isValidProgram = program && 'program' in program;
  const errorProgram = program && 'error' in program;

  const form = useForm<NewProgramImageFileType | UpdateProgramImageFileType>({
    resolver: zodResolver(
      isValidProgram ? updateProgramImageFileSchema : newProgramImageFileSchema,
    ),
    mode: 'onChange',
    defaultValues: isValidProgram
      ? (() => {
          const { prerequisites, imgUrl, ...programInfo } = program.program;
          const prerequisiteCourses = prerequisites.map(({ id }) => id);
          const availableProgramInfo = Object.fromEntries(
            Object.entries(programInfo).filter(([_, value]) => value !== null),
          );
          return {
            ...availableProgramInfo,
            image: imgUrl,
            prerequisiteCourses,
          };
        })()
      : {},
  });

  const { handleSubmit, setError } = form;

  const onSubmit = (
    programInput: NewProgramImageFileType | UpdateProgramImageFileType,
  ) => {
    const { image, ...data } = programInput;
    let newProgramForm: NewProgramType | undefined;
    let updateProgramForm: UpdateProgramType | undefined;

    if (image instanceof File) {
      const formData = new FormData();
      formData.append('image', image);
      if (isValidProgram)
        updateProgramForm = {
          formData,
          data: { ...data, id: program.program.id },
        };
      else {
        newProgramForm = { formData, data };
      }
    } else if (isValidProgram) {
      updateProgramForm = {
        data: { ...data, id: program.program.id },
      };
    }

    startTransition(() => {
      if (updateProgramForm) {
        updateProgram(updateProgramForm).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success, {
              action: {
                label: 'View Program',
                onClick: () => router.push(`/${data.recordId}`),
              },
            });
            router.refresh();
          }
        });
      } else if (newProgramForm) {
        newProgram(newProgramForm).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
            if (data.formErrors && data.formErrors.length > 0) {
              data.formErrors.map(({ field, message }) =>
                setError(field, { type: 'manual', message }),
              );
            }
          } else {
            toast.success(data.success, {
              action: {
                label: 'View Program',
                onClick: () => router.push(`/${data.recordId}`),
              },
            });
          }
        });
      }
    });
  };

  if (errorProgram) {
    toast.error(program.error);
    router.push('/');
    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          'grid grid-cols-2 gap-x-4 gap-y-6 self-center p-8 md:w-3/4',
          isValidProgram ? 'md:pt-4' : 'md:pt-12',
          className,
        )}
        {...props}
      >
        <FormHeader
          label={`${isValidProgram ? 'Update this' : 'New'} program`}
          description={`Complete the form below and submit to ${isValidProgram ? 'update this program' : 'add a program'}`}
          className="col-span-2"
        />
        <ReusableForm
          formFields={programFields(programOptions, moodleCourseOptions)}
        />
        <SubmitButton
          label={`${isValidProgram ? 'Update This' : 'Create New'} Program`}
          isSubmitting={isPending}
          className="w-full my-4"
        />
      </form>
    </Form>
  );
};

export default ProgramForm;
