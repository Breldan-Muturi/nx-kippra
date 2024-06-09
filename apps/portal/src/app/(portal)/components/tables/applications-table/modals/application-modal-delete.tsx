'use client';
import { deleteApplication } from '@/actions/applications/delete.applications.actions';
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

const DeleteApplication = ({ id, handleDismiss }: ApplicationModalType) => {
  const [isPending, startTransition] = useTransition();

  const handleDeleteApplication = () => {
    startTransition(() => {
      deleteApplication(id)
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
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
            Delete this application?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Deleting this application will trigger an email notification to all
            application participants informing them of this deletion. The slots
            for the training session will be updated by adding the slots
            consumed in this application
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <SubmitButton
            isSubmitting={isPending}
            onClick={handleDeleteApplication}
            className="bg-red-600 hover:bg-red-700"
            label="Delete"
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteApplication;
