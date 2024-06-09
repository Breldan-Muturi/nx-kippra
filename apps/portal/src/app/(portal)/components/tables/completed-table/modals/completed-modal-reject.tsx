'use client';
import { respondCompleted } from '@/actions/completed-programs/respond.completed.actions';
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
import { FormFieldType } from '@/types/form-field.types';
import {
  ActionCompletedSchema,
  actionCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const rejectCompletionFields: FormFieldType<ActionCompletedSchema>[] = [
  {
    name: 'message',
    label: 'Enter reject message',
    placeholder: 'eg. The certificates added are no longer valid',
    className: 'w-full',
    description:
      'This email will be sent to the participant and prompt them to update their completed program.',
    type: 'textarea',
  },
];

const CompletedModalReject = ({
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

  const onSubmit = (values: ActionCompletedSchema) =>
    startTransition(() => {
      respondCompleted({ ids, approved: false, message: values.message })
        .then((data) => {
          if ('error' in data) {
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
    <Dialog open onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Reject completed program${ids.length > 1 ? 's' : ''}`}</DialogTitle>
          <DialogDescription>
            {`Optionally add a message to inform ${ids.length > 1 ? 'these' : 'this'} participant${ids.length > 1 ? 's' : ''} why their
            completed program submission${ids.length > 1 ? 's' : ''} ${ids.length > 1 ? 'were' : 'was'} rejected`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <ReusableForm formFields={rejectCompletionFields} />
            <DialogFooter>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={handleDismiss}
              >
                Cancel
              </Button>
              <SubmitButton
                // className="my-4"
                label="Reject"
                isSubmitting={isPending}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedModalReject;
