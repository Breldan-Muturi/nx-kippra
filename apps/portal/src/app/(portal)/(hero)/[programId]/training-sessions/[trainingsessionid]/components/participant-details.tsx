import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { avatarFallbackName } from '@/helpers/user.helper';
import { cn } from '@/lib/utils';
import { ParticipantSelectOption } from '@/validation/applications/user.application.validation';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { Check } from 'lucide-react';
import React from 'react';

type ParticipantDetailProps = ParticipantSelectOption &
  React.HTMLAttributes<HTMLDivElement> & {
    isSelected: boolean;
  };

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  name = 'Unnamed participant',
  image,
  email,
  isSelected = false,
  className,
  ...props
}) => {
  return (
    <>
      <Check
        color="green"
        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      <div
        className={cn('flex items-center justify-between space-x-4', className)}
        {...props}
      >
        <Avatar>
          {image && <AvatarImage src={image} alt={`${name}'s profile photo`} />}
          {name && (
            <AvatarFallback className="flex h-full w-full items-center justify-center">
              {avatarFallbackName(name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </>
  );
};

export default ParticipantDetail;
