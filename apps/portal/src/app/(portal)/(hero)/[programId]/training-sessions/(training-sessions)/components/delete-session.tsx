"use client";
import { deleteTrainingSession } from "@/actions/training-session/training-session.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrainingSession } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

const DeleteSession = ({
  trainingSession: { id, programId },
}: {
  trainingSession: TrainingSession;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dismissModal = () => router.push(`/${programId}/training-sessions`);
  const handleDelete = () => {
    startTransition(() => {
      deleteTrainingSession(id)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            toast.success(data.success);
          }
        })
        .finally(dismissModal);
    });
  };
  return (
    <AlertDialog open onOpenChange={dismissModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently this training
            session. Completed applications for this training session will be
            updated to enrol into the next training session. Other applications
            will be deleted
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {isPending && (
              <Loader2 color="white" className="w-4 h-4 mr-2 animate-spin" />
            )}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSession;
