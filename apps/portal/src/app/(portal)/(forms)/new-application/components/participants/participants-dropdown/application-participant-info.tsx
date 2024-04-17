import { DynamicParticipantOption } from '@/actions/participants/application.participants.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { avatarFallbackName } from '@/helpers/user.helper';
import { cn } from '@/lib/utils';
import { AlertCircle, Check } from 'lucide-react';

type ApplicationParticipantInfo = React.ComponentPropsWithoutRef<'div'> & {
  participantInfo: DynamicParticipantOption;
  isEnrolled: boolean;
  isSelected: boolean;
};

const ApplicationParticipantInfo = ({
  participantInfo: { image, name, email },
  isEnrolled,
  isSelected,
  className,
  ...props
}: ApplicationParticipantInfo) => {
  return (
    <>
      {isEnrolled ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertCircle color="red" className="mr-2 size-4" />
          </TooltipTrigger>
          <TooltipContent color="red">
            This participant has already been added to an application for this
            training session
          </TooltipContent>
        </Tooltip>
      ) : (
        <Check
          color="green"
          className={cn(
            'mr-2 size-4',
            isSelected ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      <div
        className={cn('flex items-center justify-between space-x-4', className)}
        {...props}
      >
        <Avatar>
          {image && <AvatarImage src={image} alt={`${name}'s profile image`} />}
          <AvatarFallback className="flex size-full items-center justify-center">
            {avatarFallbackName(name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </>
  );
};

export default ApplicationParticipantInfo;
