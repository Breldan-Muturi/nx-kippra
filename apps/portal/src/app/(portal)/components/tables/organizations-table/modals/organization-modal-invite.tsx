import { respondInvite } from '@/actions/invites/respond.invites.actions';
import { ValidateInvite } from '@/actions/invites/validate.invites.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { avatarFallbackName } from '@/helpers/user.helper';
import { TableModalProps } from '@/types/tables.types';
import { format } from 'date-fns';
import { CheckSquare2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { toast } from 'sonner';

type InviteOrgModalProps = Omit<TableModalProps, 'id'> & {
  orgInvite: ValidateInvite;
};
const InviteOrgModal = ({
  open,
  handleDismiss,
  orgInvite,
}: InviteOrgModalProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let modalTitle: string = '',
    modalDescription: string = '';

  if ('error' in orgInvite) {
    modalTitle = 'Error retrieving the organization invite';
    modalDescription =
      'Failed to retrieve organization invite due to a server error. Please try again later';
  } else if ('invalid' in orgInvite) {
    modalTitle = 'Invalid organization invite';
    modalDescription =
      'Could not find a matching invite. Please contact the organization admin and try again later.';
  } else if (
    'invite' in orgInvite &&
    (orgInvite.invite?.expires as Date) < new Date()
  ) {
    modalTitle = 'Expired organization invite';
    modalDescription = `This invite expired on ${format(orgInvite.invite?.expires as Date, 'PPP')}. Please ask the organization admin to resend your invite.`;
  } else {
    modalTitle = `Join ${orgInvite.invite?.organization.name as string}.`;
    modalDescription =
      'This makes it easier to book your slot for training sessions by this organization.';
  }

  const validInvite =
    'invite' in orgInvite && (orgInvite.invite?.expires as Date) > new Date();

  const handleResponse = (accepted: boolean) =>
    startTransition(() => {
      if (validInvite)
        respondInvite({ accepted, id: orgInvite.invite?.id as string })
          .then((data) => {
            if (data.error) {
              toast.error(data.error);
            } else if (data.success) {
              toast.success(data.success);
              router.refresh();
            }
          })
          .finally(handleDismiss);
    });

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="flex space-x-4 sm:max-w-[425px]">
        {validInvite && (
          <Avatar className="size-16 ring-4 ring-green-600/60">
            <AvatarImage
              src={orgInvite.invite?.organization.image || undefined}
              alt={`${orgInvite.invite?.organization.name}'s profile image`}
            />
            <AvatarFallback className="text-4xl">
              {orgInvite.invite?.organization.name
                ? avatarFallbackName(orgInvite.invite?.organization.name)
                : 'NA'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col flex-grow pr-4 space-y-4">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full gap-2 text-red-600/80 border-red-600/80 hover:text-red-600 hover:border-red-600"
              onClick={() => handleResponse(false)}
              disabled={isPending}
            >
              <X />
              Decline
            </Button>
            <Button
              className="w-full bg-green-600 gap-2"
              onClick={() => handleResponse(true)}
              disabled={isPending}
            >
              <CheckSquare2 />
              Accept
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteOrgModal;
