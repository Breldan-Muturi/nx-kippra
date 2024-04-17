'use client';
import { SelectOptions } from '@/types/form-field.types';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import React, { useTransition } from 'react';
import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import {
  NewProgramImageFileType,
  UpdateProgramImageFileType,
  newProgramImageFileSchema,
  updateProgramImageFileSchema,
} from '@/validation/programs/program.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  NewProgramType,
  newProgram,
} from '@/actions/programmes/new.programs.actions';
import programFields from './program-form-fields';
import { SingleProgramReturn } from '@/actions/programmes/single.program.actions';
import { cn } from '@/lib/utils';
import {
  UpdateProgramType,
  updateProgram,
} from '@/actions/programmes/update.programs.action';

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
          }
        });
      } else if (newProgramForm) {
        newProgram(newProgramForm).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
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
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'flex w-full flex-col gap-x-4 gap-y-2 self-center p-8 md:w-3/4',
          isValidProgram ? 'md:pt-4' : 'md:pt-12',
          className,
        )}
        {...props}
      >
        <FormHeader
          label={`${isValidProgram ? 'Update this' : 'New'} program`}
          description={`Complete the form below and submit to ${isValidProgram ? 'update this program' : 'add a program'}`}
        />
        <ReusableForm
          formFields={programFields(programOptions, moodleCourseOptions)}
        />
        <SubmitButton
          label={`${isValidProgram ? 'Update This' : 'Create New'} Program`}
          isSubmitting={isPending}
          className="my-8 w-full"
        />
      </form>
    </Form>
  );
};

export default ProgramForm;
