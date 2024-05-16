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
import { TableModalProps } from '@/types/tables.types';
import { deleteOrganization } from '@/actions/organization/delete.organization.actions';
import { useRouter } from 'next/navigation';

type DeleteOrgModalProps = TableModalProps & {
  triggeredByRemove?: boolean;
};
export type DeleteOrgProps = Pick<
  DeleteOrgModalProps,
  'id' | 'triggeredByRemove'
>;

const DeleteOrgModal = ({
  open,
  id,
  handleDismiss,
  triggeredByRemove,
}: DeleteOrgModalProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeleteOrganization = () => {
    startTransition(() => {
      deleteOrganization(id)
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            router.refresh();
          }
        })
        .finally(handleDismiss);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            {`Delete this organization? ${triggeredByRemove ? '(No other organization users)' : ''}`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {triggeredByRemove
              ? 'Since there are no other users in this organization. It will be deleted after you remove yourself. '
              : 'Deleting this organization will trigger an email notification to all members informing them of this deletion.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-red-600"
            onClick={handleDeleteOrganization}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOrgModal;
