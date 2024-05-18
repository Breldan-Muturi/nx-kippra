'use client';
import { deleteOrganization } from '@/actions/organization/delete.organization.actions';
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
import { TableModalProps } from '@/types/tables.types';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

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
          <SubmitButton
            type="button"
            label="Continue"
            className="bg-red-600"
            onClick={handleDeleteOrganization}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOrgModal;
