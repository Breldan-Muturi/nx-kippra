'use client';
import { TrainingSessionApplication } from '@/actions/training-session/single.training-session.actions';
import { ViewSessionState } from '@/app/(portal)/hooks/use-training-session-modals';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import TooltipLinkButton, {
  TooltipLinkButtonProps,
} from '@/components/buttons/tooltip-link-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDeliveryMode, formatVenues } from '@/helpers/enum.helpers';
import { avatarFallbackName } from '@/helpers/user.helper';
import useMediaQuery from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { ExtendedUser } from '@/types/next-auth';
import { Delivery, TrainingSession, UserRole } from '@prisma/client';
import { format } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePen,
  MousePointerSquare,
  PanelBottomClose,
  PanelRightClose,
  Pencil,
  ShieldCheck,
  UserPlus,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type TrainingSessionSheetProps = React.ComponentPropsWithoutRef<'div'> &
  ViewSessionState & {
    isPending: boolean;
    dismissModal: () => void;
    viewSession: (id: string) => void;
    updateSession: (dataUpdate: TrainingSession) => void;
    user?: ExtendedUser;
  };

type FeesRow = {
  citizenship: string;
  kes: string;
  usd: string;
};

const ViewSession = ({
  dataView,
  nextId,
  prevId,
  isPending,
  viewSession,
  updateSession,
  dismissModal,
  user,
}: TrainingSessionSheetProps) => {
  const showSheet = useMediaQuery('sm');
  const {
    programId,
    program: { title, image },
    applications,
    id,
    startDate,
    endDate,
    mode,
    venue,
    citizenFee,
    usdCitizenFee,
    eastAfricaFee,
    usdEastAfricaFee,
    globalParticipantFee,
    usdGlobalParticipantFee,
    citizenOnlineFee,
    usdCitizenOnlineFee,
    eastAfricaOnlineFee,
    usdEastAfricaOnlineFee,
    globalParticipantOnlineFee,
    usdGlobalParticipantOnlineFee,
    onPremiseSlots,
    onPremiseSlotsTaken,
    onlineSlots,
    onlineSlotsTaken,
  } = dataView;
  const isAdmin = user?.role === UserRole.ADMIN;
  const dateStart = format(startDate, 'PPP');
  const dateEnd = format(endDate, 'PPP');
  const deliveryMode = formatDeliveryMode(mode);
  const sessionVenue = venue ? formatVenues(venue) : undefined;
  const programImage: React.ReactNode | undefined = !!image?.fileUrl ? (
    <div className="w-full relative h-[200px]">
      <Image
        src={image.fileUrl}
        alt={`${title}'s featured image`}
        fill
        className="object-cover object-bottom"
      />
    </div>
  ) : undefined;

  const applicationRole = ({
    owner,
    participants,
    invoice,
  }: TrainingSessionApplication):
    | ('Applicant' | 'Participant' | 'Payee')[]
    | [] => {
    let roles: ('Applicant' | 'Participant' | 'Payee')[] = [];
    if (owner.email === user?.email) {
      roles.push('Applicant');
    }
    if (participants.map(({ email }) => email === user?.email)) {
      roles.push('Participant');
    }
    if (invoice.map(({ invoiceEmail }) => invoiceEmail === user?.email)) {
      roles.push('Payee');
    }
    return roles;
  };

  const onlineFees: FeesRow[] = [
    ...(citizenOnlineFee || usdCitizenOnlineFee
      ? [
          {
            citizenship: 'Kenyan',
            kes: citizenOnlineFee?.toLocaleString('en-US') ?? 'N/A',
            usd: usdCitizenOnlineFee?.toLocaleString('en-US') ?? 'N/A',
          },
        ]
      : []),
    ...(eastAfricaOnlineFee || usdEastAfricaOnlineFee
      ? [
          {
            citizenship: 'East African',
            kes: eastAfricaOnlineFee?.toLocaleString('en-US') ?? 'N/A',
            usd: usdEastAfricaOnlineFee?.toLocaleString('en-US') ?? 'N/A',
          },
        ]
      : []),
    ...(globalParticipantOnlineFee || usdGlobalParticipantOnlineFee
      ? [
          {
            citizenship: 'Global',
            kes: globalParticipantOnlineFee?.toLocaleString('en-US') ?? 'N/A',
            usd:
              usdGlobalParticipantOnlineFee?.toLocaleString('en-US') ?? 'N/A',
          },
        ]
      : []),
  ];

  const onPremiseFees: FeesRow[] = [
    ...(citizenFee || usdCitizenFee
      ? [
          {
            citizenship: 'Kenyan',
            kes: citizenFee?.toLocaleString('en-US') ?? 'N/A',
            usd: usdCitizenFee?.toLocaleString('en-US') ?? 'N/A',
          },
        ]
      : []),
    ...(eastAfricaFee || usdEastAfricaFee
      ? [
          {
            citizenship: 'East African',
            kes: eastAfricaFee?.toLocaleString('en-US') ?? 'N/A',
            usd: usdEastAfricaFee?.toLocaleString('en-US') ?? 'N/A',
          },
        ]
      : []),
    ...(globalParticipantFee || usdGlobalParticipantFee
      ? [
          {
            citizenship: 'Global',
            kes: globalParticipantFee?.toLocaleString('en-US') ?? 'N/A',
            usd: usdGlobalParticipantFee?.toLocaleString('en-US') ?? 'N/A',
          },
        ]
      : []),
  ];

  const navButtons: TooltipActionButtonProps[] = [
    ...(!!prevId
      ? [
          {
            title: 'Previous training session',
            icon: <ChevronLeft className="size-5" />,
            disabled: isPending,
            onClick: () => viewSession(prevId),
          },
        ]
      : []),
    ...(!!nextId
      ? [
          {
            title: 'Next training Session',
            icon: <ChevronRight className="size-5" />,
            disabled: isPending,
            onClick: () => viewSession(nextId),
          },
        ]
      : []),
  ];

  const actionButtons: (TooltipLinkButtonProps | TooltipActionButtonProps)[] = [
    ...(isAdmin
      ? [
          {
            title: 'Update training Session',
            icon: <Pencil className="size-5" />,
            disabled: isPending,
            onClick: () => updateSession({ ...dataView }),
          },
          {
            title: 'Update program',
            icon: <FilePen className="size-5" />,
            disabled: isPending,
            href: `/${programId}/update`,
          },
        ]
      : []),
    {
      title: `Go to program page`,
      icon: <MousePointerSquare className="size-5" />,
      disabled: isPending,
      href: `/${programId}`,
    },
    {
      title: 'Dismiss modal',
      icon: showSheet ? (
        <PanelRightClose color="red" className="size-5" />
      ) : (
        <PanelBottomClose color="red" className="size-5" />
      ),
      disabled: isPending,
      onClick: () => dismissModal(),
      tooltipContentClassName: 'text-red-600',
    },
  ];

  const isOnline =
    mode !== Delivery.ON_PREMISE && onlineSlots - onlineSlotsTaken > 0;
  const isOnprem =
    mode !== Delivery.ONLINE && onPremiseSlots - onPremiseSlotsTaken > 0;

  const sessionInfo: React.ReactNode = (
    <>
      {programImage}
      <ul className="w-full p-3 mt-4 space-y-2 list-none sm:pt-0 sm:mt-0">
        <li className="items-center">
          Delivery:{' '}
          <Badge className="bg-green-600 hover:bg-green-600">
            {deliveryMode}
          </Badge>
        </li>
        {sessionVenue && (
          <li className="flex items-center space-x-2">
            <p>Venue: </p>
            <p className="mr-2 font-bold text-muted-foreground">
              {sessionVenue}
            </p>
          </li>
        )}
        {isOnprem && (
          <li className="flex items-center space-x-2">
            <p>On premise slots: </p>
            <p className="mr-2 font-bold text-muted-foreground">
              <span className="text-green-600">
                {onPremiseSlots - onPremiseSlotsTaken}
              </span>
              {'/'}
              {onPremiseSlots}
            </p>
          </li>
        )}
        {isOnline && (
          <li className="flex items-center space-x-2">
            <p>Online slots: </p>
            <p className="mr-2 font-bold text-muted-foreground">
              <span className="text-green-600">
                {onlineSlots - onlineSlotsTaken}
              </span>
              {'/'}
              {onlineSlots}
            </p>
          </li>
        )}
      </ul>
      <ScrollArea className="p-0.5">
        <Table>
          <TableCaption>
            Fees may be updated on a per application basis.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Citizenship</TableHead>
              <TableHead>KES</TableHead>
              <TableHead>{`USD($)`}</TableHead>
            </TableRow>
          </TableHeader>
          {isOnprem && onPremiseFees.length > 0 && (
            <>
              <TableHeader>
                <TableRow className="bg-gray-200/40">
                  <TableHead colSpan={3} className="text-center text-green-600">
                    On Premise
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onPremiseFees.map(({ citizenship, kes, usd }) => (
                  <TableRow key={`on-prem-${citizenship}${kes}${usd}`}>
                    <TableCell>{citizenship}</TableCell>
                    <TableCell>{kes}</TableCell>
                    <TableCell>{usd}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
          {isOnline && onlineFees.length > 0 && (
            <>
              <TableHeader>
                <TableRow className="bg-gray-200/40">
                  <TableHead colSpan={3} className="text-center text-green-600">
                    Online
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onlineFees.map(({ citizenship, kes, usd }) => (
                  <TableRow key={`online-${citizenship}${kes}${usd}`}>
                    <TableCell>{citizenship}</TableCell>
                    <TableCell>{kes}</TableCell>
                    <TableCell>{usd}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {user && (
        <div className="flex flex-col p-2 space-y-4">
          <p className="font-bold text-green-600">Applications</p>
          <Separator />
          {applications && applications.length > 0 ? (
            <>
              <div className="flex items-center justify-evenly">
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="size-4" />
                  <p className="text-sm text-muted-foreground">Applicant</p>
                </div>
                <div className="flex items-center space-x-1">
                  <UserPlus className="size-4" />
                  <p className="text-sm text-muted-foreground">Participant</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Wallet className="size-4" />
                  <p className="text-sm text-muted-foreground">Payee</p>
                </div>
              </div>
              {applications.map((application) => {
                const {
                  owner: { name, image, email },
                  id,
                  submittedAt,
                } = application;
                const applicationButton: TooltipLinkButtonProps = {
                  title: `View application`,
                  icon: <ExternalLink className="size-5" />,
                  disabled: isPending,
                  href: `/applications/?applicationId=${id}`,
                };
                const roles = applicationRole(application);
                return (
                  <Card
                    key={id}
                    className="flex items-center p-2 space-x-2 rounded-sm"
                  >
                    <Avatar className="size-12">
                      <AvatarImage
                        src={image?.fileUrl}
                        alt={`${name}'s profile image`}
                      />
                      <AvatarFallback className="flex items-center justify-center size-full">
                        {avatarFallbackName(name)}
                      </AvatarFallback>
                    </Avatar>
                    <CardHeader className="flex w-[calc(100vw-120px)] sm:w-56 p-2">
                      <CardTitle className="truncate">{name}</CardTitle>
                      <CardDescription className="truncate">
                        {email}
                      </CardDescription>
                      <CardDescription className="truncate">
                        {format(submittedAt, 'PPP')}
                      </CardDescription>
                      {roles.length > 0 && (
                        <div className="flex items-center mt-1 space-x-2">
                          {roles.map((role) => (
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  key={role}
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full size-6"
                                >
                                  {role === 'Applicant' && (
                                    <ShieldCheck className="size-4 text-muted-foreground" />
                                  )}
                                  {role === 'Participant' && (
                                    <UserPlus className="size-4 text-muted-foreground" />
                                  )}
                                  {role === 'Payee' && (
                                    <Wallet className="size-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{role}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <TooltipLinkButton {...applicationButton} />
                  </Card>
                );
              })}
            </>
          ) : (
            <CardDescription className="text-center">
              {`${isAdmin ? 'There are' : 'You have'} no applications for this session.`}
            </CardDescription>
          )}
          <Link
            href={`/${programId}/training-sessions/${id}`}
            title="Apply for session"
            className={cn(buttonVariants(), 'h-8 bg-green-600')}
          >
            Apply for session
          </Link>
          <Separator />
          <Link
            href={`/${programId}`}
            title="View program"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-9 gap-2')}
          >
            <MousePointerSquare className="size-4" />
            View program
          </Link>
          {isAdmin && (
            <>
              <Link
                href={`/${programId}/update`}
                title="Update program"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-9 gap-2',
                )}
              >
                <FilePen className="size-4" />
                Update program
              </Link>
              <Button
                variant="outline"
                className="gap-2 h-9"
                disabled={isPending}
                onClick={() => updateSession({ ...dataView })}
              >
                <Pencil className="size-4" />
                Update training session
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );

  const sessionDescription: React.ReactNode = (
    <>
      From <span className="font-bold text-green-600">{dateStart}</span> to{' '}
      <span className="font-bold text-green-600">{dateEnd}</span>
    </>
  );

  const sessionActions: React.ReactNode = (
    <>
      <div className="flex items-center flex-grow space-x-2">
        {navButtons.map((action, i) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      </div>
      <div className="flex items-center ml-auto space-x-2">
        {actionButtons.map((action, i) => {
          if ('href' in action) {
            return <TooltipLinkButton key={action.title} {...action} />;
          } else {
            return <TooltipActionButton key={action.title} {...action} />;
          }
        })}
      </div>
    </>
  );

  if (showSheet) {
    return (
      <Sheet open onOpenChange={dismissModal}>
        <SheetContent className="flex flex-col justify-between p-2">
          <SheetHeader className="p-2">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{sessionDescription}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[640px]">{sessionInfo}</ScrollArea>
          <SheetFooter className="flex flex-row justify-between w-full">
            {sessionActions}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Drawer open onClose={dismissModal}>
      <DrawerContent className="flex flex-col justify-between">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{sessionDescription}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="h-[520px]">{sessionInfo}</ScrollArea>
        <DrawerFooter className="flex-row justify-between w-full">
          {sessionActions}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ViewSession;
