'use client';
import { submitAdminApplication } from '@/actions/applications/submit.applications.actions';
import { ValidAdminApplication } from '@/actions/applications/validate.applications.actions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCurrentRole } from '@/hooks/use-current-role';
import { cn } from '@/lib/utils';
import { PayeeForm } from '@/validation/payment/payment.validation';
import { Citizenship } from '@prisma/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import ApplicationModalSidebar from './application-modal-sidebar';
import applicationModalSteps from './application-modal-steps';

type ApplicationModalProps = {
  open: boolean;
  onOpenChange: () => void;
  validAdminApplication: ValidAdminApplication;
};

export type ApplicationSlots = Pick<
  ValidAdminApplication['data'],
  'slotsCitizen' | 'slotsEastAfrican' | 'slotsGlobal'
>;

export type ApplicationModalState = {
  formStep: number;
  applicationFee?: number;
  usingUsd?: boolean;
  formParticipants: ValidAdminApplication['data']['participants'];
  formSlots: ApplicationSlots;
  organizationId: ValidAdminApplication['data']['organizationId'];
  payee: PayeeForm | undefined;
  hasWarning: boolean;
  hasError: boolean;
};

const ApplicationModal = ({
  open,
  onOpenChange,
  validAdminApplication,
}: ApplicationModalProps) => {
  const {
    data,
    applicationTrainingSession,
    participantWarnings,
    organizationError,
    organizationSuccess,
  } = validAdminApplication;
  const {
    startDate,
    endDate,
    program: { title },
  } = applicationTrainingSession;

  const {
    participants,
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
    organizationId,
  } = data;

  let submissionSlots: ApplicationSlots = { ...data };
  if (participants && participants.length) {
    const {
      slotsCitizen: participantsCitizen,
      slotsEastAfrican: participantsEastAfrican,
      slotsGlobal: participantsGlobal,
    }: ApplicationSlots = participants.reduce(
      (acc, { citizenship }) => {
        switch (citizenship) {
          case Citizenship.KENYAN:
            acc.slotsCitizen++;
            break;
          case Citizenship.EAST_AFRICAN:
            acc.slotsEastAfrican++;
            break;
          case Citizenship.GLOBAL:
            acc.slotsGlobal++;
            break;
        }
        return acc;
      },
      {
        slotsCitizen: 0,
        slotsEastAfrican: 0,
        slotsGlobal: 0,
      },
    );
    submissionSlots = {
      slotsCitizen: Math.max(participantsCitizen, slotsCitizen || 0),
      slotsEastAfrican: Math.max(
        participantsEastAfrican,
        slotsEastAfrican || 0,
      ),
      slotsGlobal: Math.max(participantsGlobal, slotsGlobal || 0),
    };
  }

  const role = useCurrentRole();
  const router = useRouter();
  const [applicationConfirmation, setApplicationConfirmation] =
    useState<ApplicationModalState>({
      formStep: 0,
      applicationFee: undefined,
      usingUsd: false,
      payee: undefined,
      formParticipants: participants,
      formSlots: submissionSlots,
      organizationId,
      hasWarning: !!participantWarnings || !!organizationError,
      hasError: !!organizationError,
    });

  const handleStep = (step: number) =>
    setApplicationConfirmation((prev) => ({ ...prev, formStep: step }));

  const { formStep } = applicationConfirmation;

  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(() => {
      submitAdminApplication({
        applicationFee: applicationConfirmation.applicationFee!,
        applicationForm: { ...data },
        payee: applicationConfirmation.payee!,
        usingUsd: applicationConfirmation.usingUsd || false,
        organizationId:
          data.organizationId || applicationConfirmation.organizationId,
        participants: applicationConfirmation.formParticipants,
        slots: applicationConfirmation.formSlots,
        validOrganization: organizationSuccess,
      })
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            router.push(`/applications/?applicationId=${data.applicationId}`);
          }
        })
        .finally(onOpenChange);
    });
  };

  const steps = applicationModalSteps({
    ...validAdminApplication,
    ...applicationConfirmation,
    setApplicationConfirmation,
    isPending,
    role,
    handleSubmit,
    handleStep,
  });

  const {
    title: { titleText, className },
    subtitle,
    content,
    previous,
    next,
  } = steps[formStep];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="flex flex-col w-full md:h-auto max-w-[900px]">
        {/* <AlertDialogContent className="w-full max-w-[900px]"> */}
        {/* <div className="flex flex-col w-full h-5/6 md:h-auto"> */}
        <AlertDialogHeader>
          <AlertDialogTitle>{`Application for ${title} from ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`}</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm this application's details before submitting
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="mb-2" />
        <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:flex-row">
          <ApplicationModalSidebar
            buttons={steps.map(({ button }) => button)}
            activeStep={applicationConfirmation.formStep}
            setFormStep={handleStep}
            className="mr-4"
          />
          <div className="w-full space-y-6">
            <div>
              <h3 className={cn('text-base font-medium', className)}>
                {titleText}
              </h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <Separator />
            <ScrollArea className="h-[120px] md:h-auto">
              {content}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
        <AlertDialogFooter className="mt-2 md:justify-between md:mt-auto">
          <AlertDialogCancel
            disabled={isPending}
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <div className="flex flex-col items-center justify-center w-full gap-2 sm:gap-6 sm:flex-row sm:w-auto">
            {previous}
            {next}
          </div>
        </AlertDialogFooter>
        {/* </div> */}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApplicationModal;
