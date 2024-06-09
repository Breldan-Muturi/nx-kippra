'use client';

import { adminApproveApplication } from '@/actions/applications/admin/approve.applications.actions';
import { ApplicationApproval } from '@/actions/applications/admin/fetch-approval.applications.actions';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormFieldType } from '@/types/form-field.types';
import {
  ApprovalSchema,
  approvalSchema,
} from '@/validation/applications/approval.application.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const ApproveApplication = ({
  data,
  handleDismiss,
}: {
  data: ApplicationApproval;
  handleDismiss: () => void;
}) => {
  const {
    id,
    applicationFee,
    currency,
    organization,
    owner: { name },
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
  } = data;

  const participants = slotsCitizen + slotsEastAfrican + slotsGlobal;

  const [isPending, startTransition] = useTransition();
  const form = useForm<ApprovalSchema>({
    resolver: zodResolver(approvalSchema),
    mode: 'onChange',
    defaultValues: {
      id,
      ...(!!applicationFee && { applicationFee }),
    },
  });

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<ApprovalSchema> = (values) =>
    startTransition(() => {
      adminApproveApplication(values)
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
          }
        })
        .finally(handleDismiss);
    });

  const formFields: FormFieldType<ApprovalSchema>[] = [
    {
      name: 'applicationFee',
      label: `Application fee (${currency === 'KES' ? 'KES' : 'USD'})`,
      placeholder: 'eg. 100000',
      type: 'number',
      className: 'w-full',
      description: !!applicationFee
        ? 'Confirm this application fee'
        : 'Enter the application fees for this training session',
    },
    {
      name: 'message',
      label: 'Enter your message below',
      description:
        'This message will be sent as an email together with the Proforma and Offer Letter',
      placeholder: !!applicationFee
        ? 'eg. Kindly follow the instructions on the Proforma Invoice to make payment'
        : "eg. We've updated the application fee. To pay kindly follow the instructions in the proforma invoice",
      className: 'w-full',
      type: 'textarea',
    },
  ];

  return (
    <AlertDialog open onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve this application?</AlertDialogTitle>
          <AlertDialogDescription>
            On approving this application, the user will receive their an offer
            letter, and pro-forma invoice. In the proforma invoice, a QR Code
            and a link are included to redirect the recipient to complete their
            payment
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col p-2 border rounded-md border-muted-background">
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <div className="flex items-center gap-2">
                <p>Currency: </p>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-green-600',
                    currency === 'KES'
                      ? 'text-green-600'
                      : 'bg-green-600 text-white',
                  )}
                >
                  {currency}
                </Badge>
              </div>
            </li>
            <li>
              Total participants:{' '}
              <span className="font-medium">{participants}</span>
            </li>
            <li>
              Kenyan citizens:{' '}
              <span
                className={cn(
                  'font-medium',
                  slotsCitizen ? 'text-green-600' : 'text-red-600',
                )}
              >
                {slotsCitizen || 0}
              </span>
              {'/'}
              <span className="font-medium">{participants}</span>
            </li>
            <li>
              East African citizens:{' '}
              <span
                className={cn(
                  'font-medium',
                  slotsEastAfrican ? 'text-green-600' : 'text-red-600',
                )}
              >
                {slotsEastAfrican || 0}
              </span>
              {'/'}
              <span className="font-medium">{participants}</span>
            </li>
            <li>
              Global citizens:{' '}
              <span
                className={cn(
                  'font-medium',
                  slotsGlobal ? 'text-green-600' : 'text-red-600',
                )}
              >
                {slotsGlobal || 0}
              </span>
              {'/'}
              <span className="font-medium">{participants}</span>
            </li>
            <li>
              Applicant: <span className="font-medium">{name}</span>
            </li>
            {organization && (
              <li>
                Organization:{' '}
                <span className="font-medium">{organization.name}</span>
              </li>
            )}
          </ul>
        </div>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <ReusableForm formFields={formFields} />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <SubmitButton isSubmitting={isPending} label="Approve" />
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApproveApplication;
