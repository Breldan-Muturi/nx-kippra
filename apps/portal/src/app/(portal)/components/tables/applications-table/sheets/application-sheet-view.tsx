'use client';

import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import TooltipLinkButton, {
  TooltipLinkButtonProps,
} from '@/components/buttons/tooltip-link-button';
import Pie, { PieData } from '@/components/charts/pie';
import FilePreview from '@/components/form/files/file-preview';
import ReusableTable from '@/components/table/reusable-table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  formatDeliveryMode,
  formatSponsorType,
  formatStatus,
} from '@/helpers/enum.helpers';
import { avatarFallbackName } from '@/helpers/user.helper';
import useMediaQuery from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { ExtendedUser } from '@/types/next-auth';
import {
  ApplicationStatus,
  Delivery,
  InvoiceStatus,
  SponsorType,
  UserRole,
} from '@prisma/client';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardX,
  ExternalLink,
  FileCheck2,
  FileText,
  PanelBottomClose,
  PanelRightClose,
  Send,
  ShieldX,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { ApplicationViewSheet } from '../applications-table';
import columnsViewParticipants from './columns-view-participants';
const ApplicationSheet = ({
  isPending,
  user,
  handleDismiss,
  application: { data, nextId, prevId },
  viewApplication,
  payApplication,
}: {
  isPending: boolean;
  user: ExtendedUser;
  handleDismiss: () => void;
  application: ApplicationViewSheet;
  viewApplication: (id: string) => void;
  payApplication: (id: string) => void;
}) => {
  const showSheet = useMediaQuery('sm');

  const {
    id,
    trainingSession: {
      program: { code, title },
      startDate,
      endDate,
    },
    owner: { id: ownerId, name, email, image, phoneNumber },
    participants,
    submittedAt,
    organization,
    sponsorType,
    delivery,
    currency,
    applicationFee,
    status,
    authorizedInfo,
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
  } = data;

  const isOrgSponsored =
    organization && sponsorType === SponsorType.ORGANIZATION;

  const isAuthorizedUser = user.role === UserRole.ADMIN || user.id === ownerId;

  const orgButton = (id: string): TooltipLinkButtonProps => ({
    title: `View organization`,
    disabled: isPending,
    icon: <ExternalLink className="size-5" />,
    href: `/organization/${id}`,
  });

  const ownerButton = (): TooltipLinkButtonProps | undefined => {
    if (isAuthorizedUser) {
      return {
        title: 'View application owner',
        disabled: isPending,
        icon: <ExternalLink className="size-5" />,
        href: `/participants/?participantId=${ownerId}`,
      };
    } else {
      return undefined;
    }
  };

  const description: React.ReactNode = (
    <>
      From{' '}
      <span className="font-semibold text-green-600">
        {format(startDate, 'PPP')}
      </span>{' '}
      to
      <span className="font-semibold text-green-600">
        {format(endDate, 'PPP')}
      </span>
    </>
  );

  const table = useReactTable({
    data: participants,
    columns: columnsViewParticipants({ isPending, user }),
    getCoreRowModel: getCoreRowModel(),
  });

  const slotsPie: PieData[] = [
    {
      id: 'Kenyan',
      label: 'Kenyan',
      value: slotsCitizen,
    },
    {
      id: 'EA',
      label: 'East African',
      value: slotsEastAfrican,
    },
    {
      id: 'Global',
      label: 'Global',
      value: slotsGlobal,
    },
  ];

  const navButtons: TooltipActionButtonProps[] = [
    ...(!!prevId
      ? [
          {
            title: 'Previous application',
            icon: <ChevronLeft className="size-5" />,
            disabled: isPending,
            onClick: () => viewApplication(prevId),
          },
        ]
      : []),
    ...(!!nextId
      ? [
          {
            title: 'Next application',
            icon: <ChevronRight className="size-5" />,
            disabled: isPending,
            onClick: () => viewApplication(nextId),
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
      onClick: handleDismiss,
      tooltipContentClassName: 'text-red-600',
    },
  ];

  const applicationActions: React.ReactNode = (
    <>
      <div className="flex items-center flex-grow space-x-2">
        {navButtons.slice(0, -1).map((action, i) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      </div>
      <TooltipActionButton
        key={navButtons[navButtons.length - 1].title}
        {...navButtons[navButtons.length - 1]}
      />
    </>
  );

  const applicationContent: React.ReactNode = (
    <div className="flex flex-col p-2 space-y-4 sm:p-0">
      <div className="flex flex-col space-y-2">
        <p className="font-semibold text-muted-foreground">Applicant</p>
        <Separator />
      </div>
      <Card className="flex items-center p-2 space-x-2">
        <Avatar>
          <AvatarImage src={image?.fileUrl} alt={`${name}'s featured image`} />
          <AvatarFallback>{avatarFallbackName(name)}</AvatarFallback>
        </Avatar>
        <CardHeader className="flex w-[calc(100vw-120px)] sm:w-56 p-2">
          <CardTitle className="truncate">{name}</CardTitle>
          <CardDescription className="truncate">{email}</CardDescription>
          {phoneNumber && (
            <CardDescription className="truncate">
              {phoneNumber}
            </CardDescription>
          )}
        </CardHeader>
        {ownerButton && <TooltipLinkButton {...ownerButton()!} />}
      </Card>
      <div className="flex flex-col space-y-2">
        <p className="font-semibold text-muted-foreground">
          Application details
        </p>
        <Separator />
      </div>
      <ul className="mb-4 space-y-2 list-none">
        <li>
          Submitted on:{' '}
          <span className="font-semibold text-green-600">
            {format(submittedAt, 'PPP')}
          </span>
        </li>
        <li>
          Status:{' '}
          <Badge
            variant={
              status === ApplicationStatus.COMPLETED ? 'default' : 'outline'
            }
            className={cn(
              status === ApplicationStatus.COMPLETED &&
                'bg-green-600 text-white',
              status === ApplicationStatus.APPROVED &&
                'border-green-600 text-green-600',
            )}
          >
            {formatStatus(status)}
          </Badge>
        </li>
        <li>
          Fee:{' '}
          <Badge
            variant={currency === 'KES' ? 'outline' : 'default'}
            className={cn(
              currency === 'KES'
                ? 'text-green-600 border-green-600'
                : 'bg-green-600 text-white',
            )}
          >
            {currency}
          </Badge>{' '}
          <span className="font-semibold text-muted-foreground">
            {applicationFee?.toLocaleString('en-US') ?? 'Not yet added'}
          </span>
        </li>
        <li>
          Delivery:{' '}
          <Badge
            variant="outline"
            className={cn(
              delivery === Delivery.ON_PREMISE && 'bg-green-600 text-white',
              delivery === Delivery.ONLINE && 'text-green-600 border-green-600',
            )}
          >
            {formatDeliveryMode(delivery)}
          </Badge>
        </li>
        <li>
          Sponsor:{' '}
          <Badge
            variant={isOrgSponsored ? 'default' : 'outline'}
            className={cn(
              isOrgSponsored
                ? 'bg-green-600 text-white'
                : 'text-green-600 border-green-600',
            )}
          >
            {formatSponsorType(sponsorType)}
          </Badge>
        </li>
      </ul>
      {/* </div> */}
      <div className="flex flex-col space-y-2">
        <p className="font-semibold text-muted-foreground">
          {`Participant${isOrgSponsored ? ' and organization' : ''} details`}
        </p>
        <Separator />
      </div>
      {organization && sponsorType === SponsorType.ORGANIZATION && (
        <Card className="flex items-center p-2 space-x-2">
          <Avatar>
            <AvatarImage
              src={organization.image?.fileUrl}
              alt={`${organization.name}'s featured image`}
            />
            <AvatarFallback>
              {avatarFallbackName(organization.name)}
            </AvatarFallback>
          </Avatar>
          <CardHeader className="flex w-[calc(100vw-120px)] sm:w-56 p-2">
            <CardTitle className="truncate">{organization.name}</CardTitle>
            <CardDescription className="truncate">
              {organization.email}
            </CardDescription>
            <CardDescription className="truncate">
              {organization.phone}
            </CardDescription>
          </CardHeader>
          <TooltipLinkButton {...orgButton(organization.id)} />
        </Card>
      )}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Application slots</CardTitle>
          <CardDescription>
            Compare the distribution of slots booked by citizenship
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 aspect-square size-full">
          <Pie data={slotsPie} />
        </CardContent>
      </Card>
      <ReusableTable
        className="sm:w-[332px] md:w-[332px]"
        emptyText="No specific participants added"
        table={table}
      />
      {authorizedInfo && (
        <>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold text-muted-foreground">
              Payment details
            </p>
          </div>
          <Separator />
          {authorizedInfo.payment.map(
            ({ id, payment_date, payment_references, paymentReceipt }) => {
              const shortenedPaymentId = id.slice(0, 7);
              return (
                <Card key={id} className="px-4 py-3 space-y-2">
                  <CardHeader className="p-0 pt-2">
                    <CardTitle>
                      Payment Id:{' '}
                      <span className="text-green-600 uppercase">
                        {shortenedPaymentId}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Payment date:{' '}
                      <span className="font-semibold text-green-600">
                        {format(payment_date, 'PPP')}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 py-2">
                    <Accordion type="single" collapsible>
                      {payment_references.map(
                        ({
                          payment_reference,
                          payment_date,
                          inserted_at,
                          currency,
                          amount,
                        }) => (
                          <AccordionItem
                            key={payment_reference}
                            value={payment_reference}
                          >
                            <AccordionTrigger className="py-3">
                              Payment Reference Id:{' '}
                              <span className="text-green-600">
                                {payment_reference}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-none list-outside">
                                <li>
                                  Payment date:{' '}
                                  <span className="font-semibold">
                                    {format(payment_date, 'PPP')}
                                  </span>
                                </li>
                                <li>
                                  Inserted at date:{' '}
                                  <span className="font-semibold">
                                    {format(inserted_at, 'PPP')}
                                  </span>
                                </li>
                                <li>
                                  Currency:{' '}
                                  <span className="font-semibold">
                                    {currency}
                                  </span>
                                </li>
                                <li>
                                  Amount:{' '}
                                  <span className="font-semibold">
                                    {amount.toLocaleString('en-US')}
                                  </span>
                                </li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ),
                      )}
                    </Accordion>
                  </CardContent>
                  {paymentReceipt && (
                    <CardFooter className="px-0 pb-2">
                      <FilePreview
                        className="w-full"
                        fileName="Payment Receipt"
                        fileSize={paymentReceipt.size}
                        fileType={paymentReceipt.contentType}
                        fileUrl={paymentReceipt.fileUrl}
                      />
                    </CardFooter>
                  )}
                </Card>
              );
            },
          )}
          {authorizedInfo.invoice.map(
            ({
              id,
              invoiceNumber,
              invoiceEmail,
              invoiceLink,
              updatedAt,
              invoiceStatus,
            }) => {
              return (
                <Card key={id} className="px-4 py-3 space-y-2">
                  <CardTitle>
                    Invoice No:{' '}
                    <span className="text-green-600">{invoiceNumber}</span>
                  </CardTitle>
                  <CardDescription>
                    Created for{' '}
                    <span className="font-semibold text-green-600">
                      {invoiceEmail}
                    </span>
                  </CardDescription>
                  <CardDescription>
                    Status:{' '}
                    <span
                      className={cn(
                        'font-semibold',
                        invoiceStatus === InvoiceStatus.SETTLED &&
                          'text-green-600',
                      )}
                    >
                      {invoiceStatus}
                    </span>
                  </CardDescription>
                  <CardDescription>
                    Last updated on:{' '}
                    <span className="font-semibold text-green-600">
                      {format(updatedAt, 'PPP')}
                    </span>
                  </CardDescription>
                  {status !== ApplicationStatus.COMPLETED && (
                    <Link
                      href={invoiceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({
                          variant: 'custom',
                        }),
                        'gap-2 h-8 w-full',
                      )}
                    >
                      <Banknote className="size-5" />
                      Complete Payment
                    </Link>
                  )}
                </Card>
              );
            },
          )}
          {status === ApplicationStatus.APPROVED && (
            <Button
              variant="outline"
              className="gap-2 text-green-600 border-green-600 h-9 hover:border-green-700 hover:text-green-700"
              disabled={isPending}
              onClick={() => payApplication(id)}
            >
              <FileText className="size-5" />
              Generate New invoice
            </Button>
          )}
          {(!!authorizedInfo.offerLetter ||
            !!authorizedInfo.proformaInvoice) && (
            <>
              <div className="flex flex-col space-y-2">
                <p className="font-semibold text-muted-foreground">
                  Application Files
                </p>
                <Separator />
              </div>
              {authorizedInfo.offerLetter && (
                <FilePreview
                  {...{
                    fileName: 'Offer letter',
                    fileSize: authorizedInfo.offerLetter.size,
                    fileType: authorizedInfo.offerLetter.contentType,
                    fileUrl: authorizedInfo.offerLetter.fileUrl,
                    filePath: authorizedInfo.offerLetter.filePath,
                  }}
                />
              )}
              {authorizedInfo.proformaInvoice && (
                <FilePreview
                  {...{
                    fileName: 'Proforma Invoice',
                    fileSize: authorizedInfo.proformaInvoice.size,
                    fileType: authorizedInfo.proformaInvoice.contentType,
                    fileUrl: authorizedInfo.proformaInvoice.fileUrl,
                    filePath: authorizedInfo.proformaInvoice.filePath,
                  }}
                />
              )}
            </>
          )}
        </>
      )}
      <div className="flex flex-col space-y-2">
        <p className="font-semibold text-muted-foreground">Actions</p>
        <Separator />
      </div>
      {status === ApplicationStatus.PENDING && user.role === UserRole.ADMIN && (
        <Button
          variant="outline"
          className="gap-2 text-green-600 border-green-600 h-9"
          disabled={isPending}
          onClick={() => payApplication(id)}
        >
          <FileCheck2 color="green" className="size-5" />
          Approve application
        </Button>
      )}
      {status !== ApplicationStatus.COMPLETED &&
        user.role === UserRole.ADMIN && (
          <Button
            variant="outline"
            className="gap-2 text-red-600 border-red-600 h-9"
            disabled={isPending}
            onClick={() => payApplication(id)}
          >
            <ShieldX color="red" className="size-5" />
            Reject application
          </Button>
        )}
      {isAuthorizedUser && (
        <Button
          variant="destructive"
          className="gap-2 h-9"
          disabled={isPending}
          onClick={() => payApplication(id)}
        >
          <Trash2 className="size-5" />
          Delete application
        </Button>
      )}
      <Button
        variant="outline"
        className="gap-2 text-red-600 border-red-600 h-9"
        disabled={isPending}
        onClick={() => payApplication(id)}
      >
        <ClipboardX color="red" className="size-5" />
        Unenroll from application
      </Button>
      <Button
        variant="outline"
        className="gap-2 h-9"
        disabled={isPending}
        onClick={() => payApplication(id)}
      >
        <Send className="size-5" />
        Send Email
      </Button>
    </div>
  );

  if (showSheet)
    return (
      <Sheet open onOpenChange={handleDismiss}>
        <SheetContent className="flex flex-col justify-between">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[640px]">
            {applicationContent}
            <ScrollBar />
          </ScrollArea>
          <SheetFooter className="flex-row justify-between w-full">
            {applicationActions}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

  return (
    <Drawer open={true} onClose={handleDismiss}>
      <DrawerContent className="flex flex-col justify-between">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="h-[520px]">
          {applicationContent}
          <ScrollBar />
        </ScrollArea>
        <DrawerFooter className="flex-row justify-between w-full">
          {applicationActions}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ApplicationSheet;
