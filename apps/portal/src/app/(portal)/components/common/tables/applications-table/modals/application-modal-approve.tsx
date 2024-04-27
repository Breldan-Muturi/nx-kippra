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
import { adminApproveApplication } from '@/actions/applications/admin/approve.applications.actions';
import { toast } from 'sonner';
import { ApplicationModalType } from '../applications-table';

const ApproveApplication = ({ id, handleDismiss }: ApplicationModalType) => {
  const [isPending, startTransition] = useTransition();

  const handleApproveApplication = () => {
    startTransition(() => {
      adminApproveApplication(id)
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
          <AlertDialogTitle>Approve this application?</AlertDialogTitle>
          <AlertDialogDescription>
            On approving this application, the user will receive their an offer
            letter, and pro-forma invoice. In the proforma invoice, a QR Code
            and a link are included to redirect the recipient to complete their
            payment
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-green-600"
            onClick={handleApproveApplication}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApproveApplication;
