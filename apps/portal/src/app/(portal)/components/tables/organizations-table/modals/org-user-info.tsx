import { RemovePopupOwnerOption } from '@/actions/organization/remove.organization.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarFallbackName } from '@/helpers/user.helper';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type OrgUserType = React.ComponentPropsWithoutRef<'div'> &
  RemovePopupOwnerOption & {
    isSelected: boolean;
  };

const OrgUser = ({
  image,
  optionLabel,
  email,
  isSelected,
  className,
  ...props
}: OrgUserType) => {
  return (
    <>
      <Check
        color="green"
        className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
      />
      <div
        className={cn('flex items-center justify-between space-x-4', className)}
        {...props}
      >
        <Avatar>
          {image && (
            <AvatarImage src={image} alt={`${optionLabel}'s profile image`} />
          )}
          <AvatarFallback className="flex items-center justify-center size-full">
            {avatarFallbackName(optionLabel)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">{optionLabel}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </>
  );
};

export default OrgUser;
