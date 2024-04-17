import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarFallbackName } from '@/helpers/user.helper';
import { cn } from '@/lib/utils';

interface TableUserCellProps extends React.ComponentPropsWithoutRef<'div'> {
  userName: string;
  userImage?: string;
  userTableOrganization?: string | null;
}

const TableUserCell = ({
  userName,
  userImage,
  userTableOrganization,
  className,
  ...props
}: TableUserCellProps) => {
  let userTableOrganizationLabel: string | undefined | null;
  if (userTableOrganization) {
    if (userTableOrganization.length > 15) {
      userTableOrganizationLabel = `${userTableOrganization.slice(0, 14)}...`;
    } else {
      userTableOrganizationLabel = userTableOrganization;
    }
  }
  return (
    <div className={cn('flex items-center space-x-4', className)} {...props}>
      <Avatar>
        <AvatarImage
          src={userImage}
          alt={`${userName}'s profile image`}
          title={`${userName}'s profile image`}
        />
        <AvatarFallback>{avatarFallbackName(userName)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start justify-start">
        <p>{userName}</p>
        {userTableOrganizationLabel && (
          <p className="truncate font-semibold text-green-600">
            {userTableOrganization}
          </p>
        )}
      </div>
    </div>
  );
};

export default TableUserCell;
