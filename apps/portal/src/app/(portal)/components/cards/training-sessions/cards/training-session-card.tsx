'use client';
import { TrainingCardSession } from '@/actions/training-session/fetch.training-sessions.actions';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import TooltipLinkButton, {
  TooltipLinkButtonProps,
} from '@/components/buttons/tooltip-link-button';
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
import { Delivery, UserRole } from '@prisma/client';
import { format } from 'date-fns';
import { Eye, MousePointerSquare, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

type TrainingSessionCardProps = React.ComponentPropsWithoutRef<'div'> & {
  data: TrainingCardSession;
  isPending: boolean;
  user?: ExtendedUser;
  sessionUpdate: (id: string) => void;
  deleteSession: (id: string) => void;
  viewSession: (id: string) => void;
  showProgram: boolean;
  showPast?: 'true' | 'false';
};

const TrainingSessionCard = ({
  data,
  isPending,
  user,
  sessionUpdate,
  deleteSession,
  viewSession,
  showProgram,
  showPast,
}: TrainingSessionCardProps) => {
  const {
    program: { id: programId, title, code },
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
  const isShowPast = showPast === 'true';
  const isAdmin = user?.role === UserRole.ADMIN;
  const slotsOnline =
    onlineSlots - onlineSlotsTaken > 0 && mode !== Delivery.ON_PREMISE
      ? onlineSlots - onlineSlotsTaken
      : undefined;
  const slotsOnPremise =
    onPremiseSlots - onPremiseSlotsTaken > 0 && mode !== Delivery.ONLINE
      ? onPremiseSlots - onPremiseSlotsTaken
      : undefined;

  const actionButtons: (TooltipLinkButtonProps | TooltipActionButtonProps)[] = [
    {
      title: `View session details`,
      icon: <Eye color="green" className="size-5" />,
      tooltipContentClassName: 'text-green-600',
      disabled: isPending,
      onClick: () => viewSession(id),
    },
    ...(isAdmin
      ? [
          {
            title: `Update training session`,
            icon: <Pencil className="size-5" />,
            disabled: isPending,
            onClick: () => sessionUpdate(id),
          },
          {
            title: 'Delete this application',
            icon: <Trash2 color="red" className="size-5" />,
            disabled: isPending,
            isVisible: isAdmin,
            tooltipContentClassName: 'text-red-600',
            onClick: () => deleteSession(id),
          },
        ]
      : []),
    ...(!showProgram
      ? [
          {
            title: `Go to program page`,
            icon: <MousePointerSquare className="size-5" />,
            disabled: isPending,
            href: `/${programId}`,
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
          {slotsOnPremise && (
            <li>
              On Premises Slots:{' '}
              <strong className="text-green-600">{slotsOnPremise}</strong>
            </li>
          )}
          {slotsOnline && (
            <li>
              Online Slots:{' '}
              <strong className="text-green-600">{slotsOnline}</strong>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-between space-y-3 xl:space-y-0 xl:flex-row">
        {!isShowPast && (
          <Link
            href={`/${programId}/training-sessions/${id}`}
            title="Apply for session"
            className={cn(
              buttonVariants(),
              'bg-green-600 rounded-full hover:bg-green-500 w-full xl:w-auto',
            )}
          >
            Apply for session
          </Link>
        )}
        <div className="flex items-center justify-center w-full space-x-4 xl:justify-normal xl:w-auto xl:space-x-1 xl:ml-auto">
          {actionButtons.map((action) => {
            if ('href' in action) {
              return <TooltipLinkButton key={action.title} {...action} />;
            } else {
              return (
                <TooltipActionButton key={`${action.title}`} {...action} />
              );
            }
          })}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TrainingSessionCard;
