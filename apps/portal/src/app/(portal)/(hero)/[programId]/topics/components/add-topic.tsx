'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormFieldType } from '@/types/form-field.types';

import { addTopic } from '@/actions/topics/topics.actions';
import FormHeader from '@/components/form/FormHeader';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  AddTopicForm,
  addTopicsSchema,
} from '@/validation/topics/topics.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const topicFields: FormFieldType<AddTopicForm>[] = [
  {
    name: 'title',
    label: 'Topic Title',
    placeholder: 'Enter topic title',
    className: 'w-full',
    type: 'text',
  },
  {
    name: 'summary',
    label: 'Topic Summary',
    placeholder: 'Enter topic summary',
    className: 'w-full',
    type: 'textarea',
  },
];

interface AddTopicProps extends React.HTMLAttributes<HTMLDivElement> {
  programId: string;
}

const AddTopic = ({ programId, className, ...props }: AddTopicProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<AddTopicForm>({
    resolver: zodResolver(addTopicsSchema),
    mode: 'onChange',
    defaultValues: {
      programId,
      title: '',
      summary: '',
    },
  });

  const dismissModal = () => {
    router.push(`/${programId}/topics`);
  };

  const onSubmit = (topicData: AddTopicForm) => {
    startTransition(() => {
      addTopic(topicData).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          form.reset();
          toast.success(data.success);
        }
        dismissModal();
      });
    });
  };
  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className={cn('w-full', className)} {...props}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormHeader label="Add a new topic" />
            <ReusableForm formFields={topicFields} />
            <SubmitButton
              label="Add a Topic"
              className="w-full"
              isSubmitting={isPending}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopic;
