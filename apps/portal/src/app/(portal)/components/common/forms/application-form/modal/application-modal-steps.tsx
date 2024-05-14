'use client';
import { ValidAdminApplication } from '@/actions/applications/validate.applications.actions';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PayeeForm } from '@/validation/payment/payment.validation';
import { Citizenship, UserRole } from '@prisma/client';
import {
  AlertTriangle,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  SquareUser,
} from 'lucide-react';
import React, { Dispatch } from 'react';
import { ApplicationModalState, ApplicationSlots } from './application-modal';
import ApplicationConfirmationFees from './application-modal-fees';
import ApplicationInfo from './application-modal-info';
import ApplicationModalPayee from './application-modal-payee';
import ApplicationWarnings from './application-modal-warnings';

export type ApplicationModalStepType = {
  button: React.ComponentPropsWithoutRef<'button'> & { label: string };
  title: React.ComponentPropsWithoutRef<'h3'> & { titleText: string };
  subtitle: string;
  content: React.ReactNode;
  previous?: React.ReactNode;
  next?: React.ReactNode;
};

export type ApplicationModalProps = ValidAdminApplication &
  ApplicationModalState & {
    setApplicationConfirmation: Dispatch<
      React.SetStateAction<ApplicationModalState>
    >;
    role?: UserRole;
    isPending: boolean;
    handleSubmit: () => void;
    handleStep: (step: number) => void;
  };

type StepButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  btnLabel: string;
  variant?: ButtonProps['variant'];
};

const StepButton: React.FC<StepButtonProps> = ({
  btnLabel,
  children,
  className,
  ...props
}) => (
  <Button className={cn('gap-2', className)} {...props}>
    {children}
    {btnLabel}
  </Button>
);

const applicationModalSteps = (
  modalStepsProps: ApplicationModalProps,
): ApplicationModalStepType[] => {
  const {
    hasWarning,
    applicationFee,
    isPending,
    payee,
    handleSubmit,
    handleStep,
    participantWarnings,
    organizationError,
    role,
    usingUsd,
    setApplicationConfirmation,
  } = modalStepsProps;
  const showWarning = !!participantWarnings || !!organizationError;

  const handlePayee = (payee: PayeeForm | undefined) =>
    setApplicationConfirmation((prev) => {
      if (prev.payee) {
        return {
          ...prev,
          payee: undefined,
        };
      } else {
        return {
          ...prev,
          payee,
        };
      }
    });

  const handleParticipants = (participantEmail: string) =>
    setApplicationConfirmation((prev) => {
      const {
        formSlots: { slotsCitizen, slotsEastAfrican, slotsGlobal },
        formParticipants,
      } = prev;
      const removedParticipant = formParticipants?.find(
        ({ email }) => email === participantEmail,
      );
      const updatedParticipants = formParticipants?.filter(
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
      }
      return {
        ...prev,
        formParticipants: updatedParticipants,
        formSlots: updatedFormSlots,
        applicationFee: undefined,
      };
    });

  const handleFees = ({
    fee,
    usingUsd,
  }: {
    fee?: number;
    usingUsd?: boolean;
  }) =>
    setApplicationConfirmation((prev) => {
      const { applicationFee, usingUsd: isUsd } = prev;
      if (!!applicationFee || !!isUsd) {
        return {
          ...prev,
          applicationFee: undefined,
          usingUsd: undefined,
        };
      } else {
        return {
          ...prev,
          applicationFee: fee,
          usingUsd,
        };
      }
    });

  const handleWarning = (hasWarning: boolean) =>
    setApplicationConfirmation((prev) => ({ ...prev, hasWarning }));

  return [
    ...(showWarning
      ? ([
          {
            button: {
              children: <AlertTriangle className="size-4" />,
              className: 'gap-2',
              label: 'Resolve Warnings',
            },
            title: {
              className: 'text-red-600',
              titleText: 'Resolve the warnings below to proceed',
            },
            subtitle:
              'Before submitting this application, kindly resolve the issues below.',
            content: (
              <ApplicationWarnings
                {...{ ...modalStepsProps, handleParticipants, handleWarning }}
              />
            ),
            next: (
              <StepButton
                disabled={isPending || hasWarning}
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleStep(1)}
                children={<ChevronRight className="size-4" />}
                btnLabel="Next to Review Application"
              />
            ),
          },
        ] as ApplicationModalStepType[])
      : []),
    {
      button: {
        children: <ClipboardList className="size-4" />,
        disabled: hasWarning,
        className: 'gap-2',
        label: 'Review Application',
      },
      title: {
        className: 'text-green-600',
        titleText: 'Application Information',
      },
      subtitle: 'Confirm the information about this is as expected.',
      content: <ApplicationInfo {...modalStepsProps} />,
      previous: showWarning ? (
        <StepButton
          disabled={isPending}
          variant="outline"
          onClick={() => handleStep(0)}
          children={<ChevronLeft className="size-4" />}
          btnLabel="Back to Application Warnings"
        />
      ) : undefined,
      next: (
        <StepButton
          disabled={isPending}
          className="bg-green-500 hover:bg-green-600"
          onClick={() => handleStep(showWarning ? 2 : 1)}
          children={<ChevronRight className="size-4" />}
          btnLabel="Next to Application Fees"
        />
      ),
    },
    {
      button: {
        children: <Banknote className="size-4" />,
        className: 'gap-2',
        label: 'Application Fees',
        disabled: hasWarning,
      },
      title: {
        className: 'text-green-600',
        titleText: 'Confirm application fees',
      },
      subtitle: 'Enter the payment information for this application',
      content: (
        <ApplicationConfirmationFees {...{ ...modalStepsProps, handleFees }} />
      ),
      previous: (
        <StepButton
          disabled={isPending}
          variant="outline"
          onClick={() => handleStep(showWarning ? 1 : 0)}
          children={<ChevronLeft className="size-4" />}
          btnLabel="Back to Application Information"
        />
      ),
      next:
        role === UserRole.ADMIN ? (
          <StepButton
            disabled={isPending || hasWarning || !applicationFee}
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleStep(showWarning ? 3 : 2)}
            children={<ChevronRight className="size-4" />}
            btnLabel="Next to Payee Details"
          />
        ) : (
          <Button
            disabled={isPending || hasWarning || usingUsd === undefined}
            onClick={handleSubmit}
            className="gap-2 bg-green-500 hover:bg-green-600"
          >
            {isPending ? (
              <Loader2 color="white" className="mr-2 size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Submit this application
          </Button>
        ),
    },
    ...(role === UserRole.ADMIN
      ? ([
          {
            button: {
              children: <SquareUser className="size-4" />,
              className: 'gap-2',
              disabled: hasWarning || !applicationFee,
              label: 'Payee Details',
            },
            title: {
              className: 'text-green-600',
              titleText: "Add the payee's details",
            },
            subtitle: 'This is used to prepare the offer letter, and invoice',
            content: (
              <ApplicationModalPayee handlePayee={handlePayee} payee={payee} />
            ),
            previous: (
              <StepButton
                disabled={isPending}
                variant="outline"
                onClick={() => handleStep(showWarning ? 2 : 1)}
                children={<ChevronLeft className="size-4" />}
                btnLabel="Back to Application Information"
              />
            ),
            next: (
              <Button
                disabled={isPending || hasWarning || !applicationFee || !payee}
                onClick={handleSubmit}
                className="gap-2 bg-green-500 hover:bg-green-600"
              >
                {isPending ? (
                  <Loader2 color="white" className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Submit this application
              </Button>
            ),
          },
        ] as ApplicationModalStepType[])
      : []),
  ];
};

export default applicationModalSteps;
