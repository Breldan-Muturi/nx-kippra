"use client";
import { deleteTopic } from "@/actions/topics/topics.actions";
import FormHeader from "@/components/form/FormHeader";
import SubmitButton from "@/components/form/SubmitButton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Topic } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";

interface DeleteTopicProps extends React.HTMLAttributes<HTMLDivElement> {
  topic: Topic;
}

const DeleteTopic = ({
  topic: { id, programId },
  className,
  ...props
}: DeleteTopicProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dismissModal = () => router.push(`/${programId}/topics`);
  const handleDelete = () => {
    startTransition(() => {
      deleteTopic(id).then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.success) {
          toast.success(data.success);
        }
        dismissModal();
      });
    });
  };

  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className={cn("w-full", className)} {...props}>
        <FormHeader
          label="Delete this topic"
          description="This action cannot be undone"
        />
        <SubmitButton
          label="Delete this Topic"
          className="w-full bg-red-600/80 hover:bg-red-600"
          onClick={handleDelete}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTopic;
