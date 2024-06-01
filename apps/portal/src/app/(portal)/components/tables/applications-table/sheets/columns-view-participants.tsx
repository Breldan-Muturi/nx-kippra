import { ViewColumnParticipant } from '@/actions/applications/single.application.action';
import TooltipLinkButton, {
  TooltipLinkButtonProps,
} from '@/components/buttons/tooltip-link-button';
import TableUserCell from '@/components/table/table-user-cell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ExtendedUser } from '@/types/next-auth';
import { UserRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, MinusSquare, MousePointerSquare } from 'lucide-react';

const columnsViewParticipants = ({
  isPending,
  user,
}: {
  isPending: boolean;
  user: ExtendedUser;
}): ColumnDef<ViewColumnParticipant>[] => {
  const isAdmin = user.role === UserRole.ADMIN;
  return [
    {
      id: 'user',
      header: 'Participant Info',
      cell: ({ row }) => {
        const { name, email, user } = row.original;
        return (
          <TableUserCell
            userName={name}
            userImage={user?.image?.fileUrl}
            userTableInfo={email}
          />
        );
      },
      enableHiding: false,
    },
    {
      id: 'Attendance',
      header: 'Confirmed',
      cell: ({ row }) => {
        const confirmed = row.original.attendanceConfirmed;
        return (
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant={confirmed ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'rounded-full',
                  confirmed && 'bg-green-600 hover:bg-green-600',
                )}
              >
                {confirmed ? (
                  <CheckCircle2 className="size-5" color="green" />
                ) : (
                  <MinusSquare className="size-5" />
                )}
              </Button>
            </TooltipTrigger>
          </Tooltip>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const { user } = row.original;
        const linkButton: TooltipLinkButtonProps | undefined = user?.id
          ? {
              title: `View participant info`,
              icon: <MousePointerSquare className="size-5" />,
              disabled: isPending,
              href: `/participants?participantId=${user.id}`,
            }
          : undefined;
        return (
          <div className="flex items-center space-x-2">
            {linkButton && <TooltipLinkButton {...linkButton} />}
            <Badge
              variant={`${user?.id ? 'default' : 'outline'}`}
              className={cn(user?.id && 'bg-green-600 hover:bg-green-600')}
            >
              {user?.id ? 'Registered participant' : 'Not registered'}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'National Id',
      header: 'National Id',
      cell: ({ row }) => row.original.nationalId,
    },
    {
      id: 'Citizenship',
      header: 'Citizenship',
      cell: ({ row }) => row.original.citizenship,
    },
  ];
};

export default columnsViewParticipants;
