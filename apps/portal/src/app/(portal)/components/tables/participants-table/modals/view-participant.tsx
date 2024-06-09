'use client';
import { ViewParticipantParams } from '@/app/(portal)/hooks/use-participant-modals';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { avatarFallbackName } from '@/helpers/user.helper';
import useMediaQuery from '@/hooks/use-media-query';
import {
  ChevronLeft,
  ChevronRight,
  PanelBottomClose,
  PanelRightClose,
} from 'lucide-react';

const ViewParticipant = ({
  isPending,
  dismissModal,
  updateRole,
  viewParticipant,
  dataView: { participant, nextId, prevId },
}: {
  isPending: boolean;
  dismissModal: () => void;
  updateRole: ({
    id,
    updateToAdmin,
  }: {
    id: string;
    updateToAdmin: boolean;
  }) => void;
  dataView: ViewParticipantParams;
  viewParticipant: (id: string) => void;
}) => {
  const showSheet = useMediaQuery('sm');
  const { image, email, name, phoneNumber } = participant;

  const header = (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage
          src={image?.fileUrl}
          alt={`${name}'s profile image`}
          title={`${name}'s profile image`}
        />
        <AvatarFallback>{avatarFallbackName(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start justify-start">
        {showSheet ? (
          <>
            <SheetTitle>{name}</SheetTitle>
            <SheetDescription>{email}</SheetDescription>
          </>
        ) : (
          <>
            <DrawerTitle>{name}</DrawerTitle>
            <DrawerDescription>{email}</DrawerDescription>
          </>
        )}
      </div>
    </div>
  );

  const actionButtons: TooltipActionButtonProps[] = [
    ...(!!prevId
      ? [
          {
            title: 'Previous participant',
            icon: <ChevronLeft className="size-5" />,
            disabled: isPending,
            onClick: () => viewParticipant(prevId),
          },
        ]
      : []),
    ...(!!nextId
      ? [
          {
            title: 'Next participant',
            icon: <ChevronRight className="size-5" />,
            disabled: isPending,
            onClick: () => viewParticipant(nextId),
          },
        ]
      : []),
    {
      title: 'Dismiss modal',
      icon: showSheet ? (
        <PanelRightClose color="red" className="size-5" />
      ) : (
        <PanelBottomClose color="red" className="size-5" />
      ),
      disabled: isPending,
      onClick: dismissModal,
      tooltipContentClassName: 'text-red-600',
    },
  ];

  const actions = (
    <>
      <div className="flex items-center flex-grow space-x-2">
        {actionButtons.slice(0, -1).map((action, i) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      </div>
      <TooltipActionButton
        key={actionButtons[actionButtons.length - 1].title}
        {...actionButtons[actionButtons.length - 1]}
      />
    </>
  );

  if (showSheet)
    return (
      <Sheet open onOpenChange={dismissModal}>
        <SheetContent className="flex flex-col justify-between">
          <SheetHeader>{header}</SheetHeader>
          <ScrollArea className="h-[640px]">
            Awaiting content
            <ScrollBar />
          </ScrollArea>
          <SheetFooter className="flex-row justify-between w-full">
            {actions}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

  return (
    <Drawer open={true} onClose={dismissModal}>
      <DrawerContent>
        <DrawerHeader>{header}</DrawerHeader>
        <ScrollArea className="h-[520px]">
          Awaiting content
          <ScrollBar />
        </ScrollArea>
        <DrawerFooter className="flex-row justify-between w-full">
          {actions}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ViewParticipant;
