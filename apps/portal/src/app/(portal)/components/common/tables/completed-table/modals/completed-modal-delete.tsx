'use client';
import { deleteCompleted } from '@/actions/completed-programs/delete.completed.actions';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form } from '@/components/ui/form';
import { FormFieldType } from '@/types/form-field.types';
import {
  ActionCompletedSchema,
  actionCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const deleteCompletedFields: FormFieldType<ActionCompletedSchema>[] = [
  {
    name: 'message',
    label: 'Enter delete message',
    placeholder: 'eg. The program is no longer active.',
    className: 'w-full',
    description: `This will inform the participant as to the cause of the deletion.`,
    type: 'textarea',
  },
];

const CompletedModalDelete = ({
  ids,
  handleDismiss,
}: {
  ids: string[];
  handleDismiss: () => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ActionCompletedSchema>({
    resolver: zodResolver(actionCompletedSchema),
    mode: 'onChange',
  });

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<ActionCompletedSchema> = (values) =>
    startTransition(() => {
      deleteCompleted({ ids, message: values.message })
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
          }
        })
        .finally(() => {
          handleDismiss();
          router.refresh();
        });
    });

  return (
    <AlertDialog open onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            {`Delete ${ids.length > 1 ? 'these' : 'this'} completed program${ids.length > 1 ? 's' : ''}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {`Deleting ${ids.length > 1 ? 'these' : 'this'} completed program${ids.length > 1 ? 's' : ''} will trigger an email notification to all
            participants informing them of this deletion. This program completion will not apply when making new applications.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <ReusableForm formFields={deleteCompletedFields} />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <SubmitButton
                className="bg-red-600"
                label="Delete"
                isSubmitting={isPending}
              />
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompletedModalDelete;
