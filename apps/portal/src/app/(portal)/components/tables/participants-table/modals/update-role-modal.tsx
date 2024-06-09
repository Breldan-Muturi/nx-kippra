import updateRole from '@/actions/participants/update.participant.actions';
import SubmitButton from '@/components/form/SubmitButton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { ParticipantModal } from '../participants-table';

const UpdateRoleModal = ({
  id,
  handleDismiss,
  updateToAdmin = true,
}: ParticipantModal & { updateToAdmin?: boolean }) => {
  const [isPending, startTransition] = useTransition();

  const handleUpdateRole = () =>
    startTransition(() => {
      updateRole({ id, updateToAdmin })
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
          }
        })
        .finally(handleDismiss);
    });

  return (
    <AlertDialog open onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {updateToAdmin
            ? 'Make this user an Admin'
            : 'Make this Admin a normal participant'}
        </AlertDialogHeader>
        <AlertDialogDescription>
          {`This user will ${updateToAdmin ? 'now' : 'not'} be able to access protected pages and perform admin functions on the portal`}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton
            isSubmitting={isPending}
            onClick={handleUpdateRole}
            label="Continue"
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateRoleModal;
