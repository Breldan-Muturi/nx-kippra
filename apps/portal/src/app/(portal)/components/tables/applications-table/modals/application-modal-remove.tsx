'use client';
import { removeApplication } from '@/actions/applications/remove.application.action';
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
import { useTransition } from 'react';
import { toast } from 'sonner';
import { ApplicationModalType } from '../applications-table';

const RemoveApplication = ({ id, handleDismiss }: ApplicationModalType) => {
  const [isPending, startTransition] = useTransition();

  const handleRemoveApplication = () => {
    startTransition(() => {
      removeApplication(id)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            toast.success(data.success);
          }
        })
        .finally(handleDismiss);
    });
  };

  return (
    <AlertDialog open onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Remove yourself from this application?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Removing yourself from this application will invalidate your slot.
            The application fees due by the application owner will be adjusted
            accordingly. An email will be shared with the application owner
            notifying them of this update
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <SubmitButton
            isSubmitting={isPending}
            onClick={handleRemoveApplication}
            className="bg-red-600 hover:bg-red-700"
            label="Continue"
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveApplication;
