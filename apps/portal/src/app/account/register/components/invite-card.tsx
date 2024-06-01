import { OrgInvite } from '@/actions/invites/validate.invites.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarFallbackName } from '@/helpers/user.helper';
import { cn } from '@/lib/utils';
import { MessageSquareWarning } from 'lucide-react';

type InviteCardProps = React.ComponentPropsWithoutRef<'div'> & {
  inviteMessage: string;
  invite?: OrgInvite;
};

const InviteCard = ({
  inviteMessage,
  invite,
  className,
  ...props
}: InviteCardProps) => {
  return (
    <div
      className={cn(
        'flex p-2 flex-col sm:flex-row sm:p-4 items-center rounded-lg border-2 space-y-2 sm:space-x-4 sm:space-y-0',
        // 'flex p-2 flex-col items-start sm:flex-row sm:p-4 sm:items-center rounded-lg border-2 space-y-2 sm:space-x-4 sm:space-y-0',
        className,
        invite ? 'border-muted-background' : 'border-red-600/20',
      )}
      {...props}
    >
      {invite ? (
        <Avatar className="size-12 sm:size-16 ring-4 ring-green-600/60">
          <AvatarImage
            src={invite.organization.image?.fileUrl}
            alt={`${invite.organization.name}'s profile image`}
          />
          <AvatarFallback className="text-lg">
            {invite.organization.name
              ? avatarFallbackName(invite.organization.name)
              : 'NA'}
          </AvatarFallback>
        </Avatar>
      ) : (
        <MessageSquareWarning
          size={50}
          color="red"
          fill="red"
          fillOpacity={0.2}
        />
      )}
      <p
        className={cn(
          'font-semibold text-xs text-center sm:text-base sm:text-left',
          invite ? 'text-muted-foreground' : 'text-red-600/60',
        )}
      >
        {inviteMessage}
      </p>
    </div>
  );
};

export default InviteCard;
