import {
  NewCompletedArgs,
  newCompleted,
} from '@/actions/completed-programs/new.completed.actions';
import {
  UserOption,
  getProgramOptions,
} from '@/actions/completed-programs/options.completed.actions';
import {
  UpdateCompletedArgs,
  updateCompleted,
} from '@/actions/completed-programs/update.completed.actions';
import { ProgramsOption } from '@/actions/programmes/programs.options.actions';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
  CompletedForm,
  CompletedSchema,
  UpdateCompletedForm,
  UpdateCompletedSchema,
  completedForm,
  updateCompletedForm,
} from '@/validation/completed-program/completed-program.validation';
import { FilePreviewSchema } from '@/validation/reusable.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import completedModalFields from './completed-modal-fields';

export type CompletedModalFormType = {
  programsOptions: ProgramsOption[];
  userOptions?: UserOption[];
  currentCompleted?: UpdateCompletedForm;
};

type CompleteFormProps = CompletedModalFormType & {
  handleDismiss: () => void;
};

const CompletedModalForm = ({
  userOptions,
  programsOptions,
  currentCompleted,
  handleDismiss,
}: CompleteFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optionsPrograms, setOptionsPrograms] = useState<ProgramsOption[]>(
    programsOptions || [],
  );

  const form = useForm<CompletedForm | UpdateCompletedForm>({
    resolver: zodResolver(
      !!currentCompleted ? updateCompletedForm : completedForm,
    ),
    defaultValues: currentCompleted,
    mode: 'onChange',
  });

  const { handleSubmit, watch, reset } = form;

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'participantId') {
        reset({ ...value, programId: '' });
        const participantId = value.participantId || '';
        if (participantId !== '')
          startTransition(() =>
            getProgramOptions(participantId).then((data) => {
              if ('error' in data) {
                toast.error(data.error);
              } else {
                setOptionsPrograms((prev) => data);
              }
            }),
          );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit: SubmitHandler<CompletedForm | UpdateCompletedForm> = (
    values,
  ) => {
    const { completionEvidence, ...completed } = values;
    const { fileArray, filePreviews } = completionEvidence.reduce(
      (acc, item) => {
        if (item instanceof File) {
          acc.fileArray.push(item);
        } else {
          acc.filePreviews.push(item as FilePreviewSchema);
        }
        return acc;
      },
      { fileArray: [] as File[], filePreviews: [] as FilePreviewSchema[] },
    );
    let isNew: NewCompletedArgs | undefined,
      isUpdate: UpdateCompletedArgs | undefined;
    const formData = new FormData();
    (fileArray as File[]).forEach((file) =>
      formData.append('completionEvidence', file),
    );
    if ('id' in values) {
      isUpdate = {
        formData,
        filePreviews,
        ...(completed as UpdateCompletedSchema),
      };
    } else {
      isNew = { formData, ...(completed as CompletedSchema) };
    }
    startTransition(() => {
      if (!!isNew) {
        newCompleted(isNew).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            handleDismiss();
            router.refresh();
          }
        });
      } else if (!!isUpdate) {
        updateCompleted(isUpdate).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            handleDismiss();
            router.refresh();
          }
        });
      }
    });
  };
  return (
    <Dialog open onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`${!!currentCompleted ? 'Update' : 'New'} completed program`}</DialogTitle>
          <DialogDescription>
            {`Complete the form below to ${!!currentCompleted ? 'update this' : 'add a new'} completed program`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <ReusableForm
              formFields={completedModalFields({
                disabled: isPending,
                userOptions,
                programsOptions: optionsPrograms,
              })}
            />
            <DialogFooter>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={handleDismiss}
              >
                Cancel
              </Button>
              <SubmitButton
                label={!!currentCompleted ? 'Update' : 'Submit'}
                isSubmitting={isPending}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedModalForm;
