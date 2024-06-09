'use client';

import { respondCompleted } from '@/actions/completed-programs/respond.completed.actions';
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
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

const CompletedModalApprove = ({
  ids,
  handleDismiss,
}: {
  ids: string[];
  handleDismiss: () => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApproveApplication = () => {
    startTransition(() => {
      respondCompleted({ ids, approved: true })
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
  };

  return (
    <AlertDialog open onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Approve this completed program${ids.length > 1 ? 's' : ''}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            On approving this completed program, the participant can freely
            apply for more courses that need completion of this course as a
            prerequisite.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <SubmitButton
            type="button"
            isSubmitting={isPending}
            onClick={handleApproveApplication}
            label="Continue"
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompletedModalApprove;
