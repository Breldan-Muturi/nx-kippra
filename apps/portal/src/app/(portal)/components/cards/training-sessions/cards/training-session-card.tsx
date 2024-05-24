'use client';
import { TrainingCardSession } from '@/actions/training-session/fetch.training-sessions.actions';
import TableAction, { TableActionProps } from '@/components/table/table-action';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDeliveryMode, formatVenues } from '@/helpers/enum.helpers';
import { cn } from '@/lib/utils';
import { ExtendedUser } from '@/types/next-auth';
import { TrainingSession, UserRole } from '@prisma/client';
import { format } from 'date-fns';
import { Eye, MousePointerSquare, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TrainingSessionCardProps = React.ComponentPropsWithoutRef<'div'> & {
  data: TrainingCardSession;
  isPending: boolean;
  user?: ExtendedUser;
  updateSession: (data: TrainingSession) => void;
  deleteSession: (id: string) => void;
  showProgram: boolean;
  showPast?: 'true' | 'false';
};

const TrainingSessionCard = ({
  data,
  isPending,
  user,
  updateSession,
  deleteSession,
  showProgram,
  showPast,
}: TrainingSessionCardProps) => {
  const {
    program: { title, code },
    programId,
    venue,
    mode,
    startDate,
    endDate,
    onPremiseSlots,
    onPremiseSlotsTaken,
    onlineSlots,
    onlineSlotsTaken,
    id,
  } = data;
  const router = useRouter();
  const isShowPast = showPast === 'true';
  const isAdmin = user?.role === UserRole.ADMIN;

  const actionButtons: TableActionProps[] = [
    {
      content: `View session details`,
      icon: <Eye color="green" className="size-5" />,
      tooltipContentClassName: 'text-green-600',
      isPending,
      onClick: () => {},
    },
    ...(isAdmin
      ? [
          {
            content: `Update training session`,
            icon: <Pencil className="size-5" />,
            isPending,
            onClick: () => updateSession(data as TrainingSession),
          },
          {
            content: 'Delete this application',
            icon: <Trash2 color="red" className="size-5" />,
            isPending,
            isVisible: isAdmin,
            tooltipContentClassName: 'text-red-600',
            onClick: () => deleteSession(data.id),
          },
        ]
      : []),
    ...(!showProgram
      ? [
          {
            content: `Go to program page`,
            icon: <MousePointerSquare className="size-5" />,
            isPending,
            onClick: () => router.push(`/${programId}`),
          },
        ]
      : []),
  ];

  return (
    <Card className="flex flex-col p-0 overflow-hidden">
      <CardHeader>
        {!showProgram && (
          <>
            <CardTitle className="leading-snug">{title}</CardTitle>
            <p className="font-medium text-green-600">{code}</p>
          </>
        )}
        <CardDescription>
          From <strong>{format(startDate, 'PPP')}</strong> to{' '}
          <strong>{format(endDate, 'PPP')}</strong>
        </CardDescription>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent className="flex flex-grow">
        <ul className="space-y-1 text-sm list-none">
          {venue && (
            <li>
              Venue: <strong>{formatVenues(venue)}</strong>
            </li>
          )}
          <li>
            Mode: <strong>{formatDeliveryMode(mode)}</strong>
          </li>
          {onPremiseSlots && (
            <li>
              On Premises Slots:{' '}
              <strong>
                {onPremiseSlotsTaken ?? 0}/{onPremiseSlots}
              </strong>
            </li>
          )}
          {onlineSlots && (
            <li>
              Online Slots:{' '}
              <strong>
                {onlineSlotsTaken ?? 0}/{onlineSlots}
              </strong>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-between space-y-3 md:space-y-0 md:flex-row">
        {!isShowPast && (
          <Link
            href={`/${programId}/training-sessions/${id}`}
            title="Apply for session"
            className={cn(
              buttonVariants(),
              'bg-green-600 rounded-full hover:bg-green-500 w-full md:w-auto',
            )}
          >
            Apply for session
          </Link>
        )}
        <div className="flex items-center justify-center w-full space-x-4 md:justify-normal md:w-auto md:space-x-1 md:ml-auto">
          {actionButtons.map((action) => (
            <TableAction {...action} />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TrainingSessionCard;
