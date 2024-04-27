'use client';
import React, { useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { userDeleteApplication } from '@/actions/applications/user/delete.applications.actions';
import { ApplicationModalType } from '../applications-table';

const DeleteApplication = ({ id, handleDismiss }: ApplicationModalType) => {
  const [isPending, startTransition] = useTransition();

  const handleDeleteApplication = () => {
    startTransition(() => {
      userDeleteApplication(id)
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
          <AlertDialogAction
            disabled={isPending}
            className="bg-red-600"
            onClick={handleDeleteApplication}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteApplication;
