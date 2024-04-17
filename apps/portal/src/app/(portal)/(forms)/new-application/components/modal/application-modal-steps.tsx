import { ValidAdminApplication } from '@/actions/applications/admin/validate.admin.applications.actions';
import React from 'react';
import ApplicationInfo from './application-modal-info';
import ApplicationWarnings from './application-modal-warnings';
import {
  AlertTriangle,
  Banknote,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  SquareUser,
} from 'lucide-react';
import ApplicationConfirmationFees from './application-modal-fees';
import ApplicationModalPayee, {
  ApplicationModalPayeeProps,
} from './application-modal-payee';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertDialogAction } from '@/components/ui/alert-dialog';
import { ApplicationSlots } from './application-modal';

export type ApplicationModalStepType = {
  button: React.ComponentPropsWithoutRef<'button'> & { label: string };
  title: React.ComponentPropsWithoutRef<'h3'> & { titleText: string };
  subtitle: string;
  content: React.ReactNode;
  previous?: React.ReactNode;
  next?: React.ReactNode;
};

export type ApplicationModalProps = ValidAdminApplication &
  ApplicationModalPayeeProps & {
    formSlots: ApplicationSlots;
    hasWarning: boolean;
    handleWarning: (resolveWarning: boolean) => void;
    isPending: boolean;
    handleStep: (step: number) => void;
    handleSubmit: () => void;
    formParticipants?: ValidAdminApplication['data']['participants'];
    handleParticipants: (participantEmail: string) => void;
    usingUsd?: boolean;
    applicationFee?: number;
    handleFees: ({
      fee,
      usingUsd,
    }: {
      fee?: number;
      usingUsd?: boolean;
    }) => void;
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
    handleStep,
    payee,
    handleSubmit,
    participantWarnings,
    organizationError,
  } = modalStepsProps;
  const showWarning = !!participantWarnings || !!organizationError;
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
            content: <ApplicationWarnings {...modalStepsProps} />,
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
      content: <ApplicationConfirmationFees {...modalStepsProps} />,
      previous: (
        <StepButton
          disabled={isPending}
          variant="outline"
          onClick={() => handleStep(showWarning ? 1 : 0)}
          children={<ChevronLeft className="size-4" />}
          btnLabel="Back to Application Information"
        />
      ),
      next: (
        <StepButton
          disabled={isPending || hasWarning || !applicationFee}
          className="bg-green-500 hover:bg-green-600"
          onClick={() => handleStep(showWarning ? 3 : 2)}
          children={<ChevronRight className="size-4" />}
          btnLabel="Next to Payee Details"
        />
      ),
    },
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
      content: <ApplicationModalPayee {...modalStepsProps} />,
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
        <AlertDialogAction
          disabled={isPending || hasWarning || !applicationFee || !payee}
          onClick={handleSubmit}
          className="gap-2 bg-green-500 hover:bg-green-600"
        >
          <CheckSquare2 className="size-4" />
          Submit this application
        </AlertDialogAction>
      ),
    },
  ];
};

export default applicationModalSteps;
