import { avatarFallbackName } from '@/helpers/user.helper';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type DropDownImageProps = React.ComponentPropsWithoutRef<'div'> & {
  image?: string;
  name: string;
  info: string;
  isSelected: boolean;
  avatarClassName?: string;
};

const DropDownImage = ({
  image,
  name,
  info,
  isSelected,
  className,
  avatarClassName,
  ...props
}: DropDownImageProps) => {
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
        <Avatar className={avatarClassName}>
          {image && <AvatarImage src={image} alt={`${name}'s image`} />}
          <AvatarFallback>{avatarFallbackName(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">{info}</p>
        </div>
      </div>
    </>
  );
};

export default DropDownImage;
