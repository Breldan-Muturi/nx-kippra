"use client";
import { updateTopic } from "@/actions/topics/topics.actions";
import FormHeader from "@/components/form/FormHeader";
import ReusableForm from "@/components/form/ReusableForm";
import SubmitButton from "@/components/form/SubmitButton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { FormFieldType } from "@/types/form-field.types";
import {
  UpdateTopicForm,
  updateTopicsSchema,
} from "@/validation/topics.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Topic } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const updateTopicFields: FormFieldType<UpdateTopicForm>[] = [
  {
    name: "title",
    label: "Topic Title",
    placeholder: "Enter topic title",
    className: "w-full",
    type: "text",
  },
  {
    name: "summary",
    label: "Topic Summary",
    placeholder: "Enter topic summary",
    className: "w-full",
    type: "textarea",
  },
];

interface UpdateTopicProps extends React.HTMLAttributes<HTMLDivElement> {
  topic: Topic;
}

const UpdateTopic = ({
  topic: { title, summary, id, programId },
  className,
  ...props
}: UpdateTopicProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateTopicForm>({
    resolver: zodResolver(updateTopicsSchema),
    mode: "onChange",
    defaultValues: {
      id,
      title,
      summary,
    },
  });

  const dismissModal = () => {
    router.push(`/${programId}/topics`);
  };

  const onSubmit = (updateTopicData: UpdateTopicForm) => {
    startTransition(() => {
      updateTopic(updateTopicData).then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.success) {
          toast.success(data.success);
          form.reset();
        }
        dismissModal();
      });
    });
  };

  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className={cn("w-full", className)} {...props}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormHeader label="Update this topic" />
            <ReusableForm formFields={updateTopicFields} />
            <SubmitButton
              label="Update Topic"
              className="w-full"
              isSubmitting={isPending}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTopic;
