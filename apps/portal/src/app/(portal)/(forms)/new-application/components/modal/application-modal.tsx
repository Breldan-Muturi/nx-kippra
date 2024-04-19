'use client';
import React, { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ValidAdminApplication } from '@/actions/applications/admin/validate.admin.applications.actions';
import ApplicationModalSidebar from './application-modal-sidebar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import applicationModalSteps from './application-modal-steps';
import { cn } from '@/lib/utils';
import { Citizenship } from '@prisma/client';
import { ApplicationModalPayeeProps } from './application-modal-payee';
import { submitAdminApplication } from '@/actions/applications/admin/submit.admin.applications.actions';
import { toast } from 'sonner';

type ApplicationModalProps = {
  open: boolean;
  onOpenChange: () => void;
  validAdminApplication: ValidAdminApplication;
};

export type ApplicationSlots = Pick<
  ValidAdminApplication['data'],
  'slotsCitizen' | 'slotsEastAfrican' | 'slotsGlobal'
>;

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

  const [applicationConfirmation, setApplicationConfirmation] = useState<{
    formStep: number;
    applicationFee?: number;
    usingUsd?: boolean;
    formParticipants: ValidAdminApplication['data']['participants'];
    formSlots: ApplicationSlots;
    organizationId: ValidAdminApplication['data']['organizationId'];
    payee: ApplicationModalPayeeProps['payee'];
    hasWarning: boolean;
    hasError: boolean;
  }>({
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

  const handleFees = ({
    fee,
    usingUsd,
  }: {
    fee?: number;
    usingUsd?: boolean;
  }) =>
    setApplicationConfirmation((prev) => ({
      ...prev,
      applicationFee: fee,
      usingUsd,
    }));

  const handlePayee = (payee: ApplicationModalPayeeProps['payee']) => {
    setApplicationConfirmation((prev) => ({ ...prev, payee }));
  };

  const handleWarning = (resolved: boolean) =>
    setApplicationConfirmation((prev) => ({ ...prev, hasWarning: resolved }));

  const handleParticipants = (participantEmail: string) =>
    setApplicationConfirmation((prev) => {
      const {
        formSlots: { slotsCitizen, slotsEastAfrican, slotsGlobal },
        formParticipants,
      } = prev;
      const removedParticipant = formParticipants?.find(
        ({ email: formParticipantEmail }) =>
          formParticipantEmail === participantEmail,
      );
      const updatedFormParticipants = formParticipants?.filter(
        ({ email }) => email !== participantEmail,
      );

      let updatedFormSlots: ApplicationSlots = {
        slotsCitizen: slotsCitizen || 0,
        slotsEastAfrican: slotsEastAfrican || 0,
        slotsGlobal: slotsGlobal || 0,
      };

      if (removedParticipant) {
        switch (removedParticipant.citizenship) {
          case Citizenship.KENYAN:
            updatedFormSlots.slotsCitizen = Math.max(
              updatedFormSlots.slotsCitizen! - 1,
              0,
            );
            break;
          case Citizenship.EAST_AFRICAN:
            updatedFormSlots.slotsEastAfrican = Math.max(
              updatedFormSlots.slotsEastAfrican! - 1,
              0,
            );
            break;
          case Citizenship.GLOBAL:
            updatedFormSlots.slotsGlobal = Math.max(
              updatedFormSlots.slotsGlobal! - 1,
              0,
            );
            break;
        }
        return {
          ...prev,
          formParticipants: updatedFormParticipants,
          formSlots: updatedFormSlots,
          applicationFee: undefined,
        };
      }
    });

  const {
    applicationFee,
    payee,
    formParticipants,
    hasWarning,
    formStep,
    formSlots,
  } = applicationConfirmation;

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
      }).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          toast.success(data.success);
        }
      });
    });
  };

  const steps = applicationModalSteps({
    ...validAdminApplication,
    applicationFee,
    handleFees,
    payee,
    handlePayee,
    formSlots,
    hasWarning,
    handleWarning,
    isPending,
    handleStep,
    handleSubmit,
    formParticipants,
    handleParticipants,
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
      <AlertDialogContent className="w-full max-w-[900px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{`Application for ${title} from ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`}</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm this application's details before submitting
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="mb-2" />
        <div className="flex mb-6">
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
            {content}
          </div>
        </div>
        <AlertDialogFooter className="md:justify-between md:mt-auto">
          <AlertDialogCancel
            disabled={isPending}
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <div className="flex items-center justify-center gap-6">
            {previous}
            {next}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApplicationModal;
