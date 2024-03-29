'use client';
import { usePathname } from 'next/navigation';
import React, { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { filterAdminApplications } from '@/actions/applications/filter.applications.actions';
import { DefaultApplicationParams } from '@/validation/application.validation';
import { FormFieldType } from '@/types/form-field.types';
import {
  PaymentForm,
  paymentFormSchema,
} from '@/validation/payment.validation';
import { Form } from '@/components/ui/form';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PayApplicationReturnType } from '@/actions/applications/user/pay.application.actions';
import { toast } from 'sonner';
import { initiatePayment } from '@/actions/payments/initiate.payment.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Card, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const payApplicationFields: FormFieldType<PaymentForm>[] = [
  {
    name: 'clientName',
    type: 'text',
    label: 'Payee full name',
    placeholder: 'eg. Ms. Anne Wanjiku',
  },
  {
    name: 'clientIDNumber',
    type: 'text',
    label: 'Payee ID/Passport Number',
    placeholder: 'eg. 331331331',
  },
  {
    name: 'clientMSISD',
    type: 'number',
    label: 'Payee Phone Number',
    placeholder: 'eg. 254711223344',
    minValue: 1,
  },
  {
    name: 'clientEmail',
    type: 'email',
    label: 'Payee email',
    placeholder: 'eg. payee@email.com',
  },
];

const PayApplication = ({
  payParams,
  paymentInfo,
}: {
  payParams: DefaultApplicationParams;
  paymentInfo: PayApplicationReturnType;
}) => {
  const [isPending, startTransition] = useTransition();
  const path = usePathname();
  const handleDismiss = () => filterAdminApplications({ path, ...payParams });
  const handleWindow = (target: string) => window.open(target, '_blank');

  const dismissModal = () => {
    startTransition(() => {
      handleDismiss();
    });
  };

  const form = useForm<PaymentForm>({
    mode: 'onChange',
    resolver: zodResolver(paymentFormSchema),
    defaultValues: !('error' in paymentInfo)
      ? paymentInfo.paymentDetails
      : {
          applicationId: '',
          billDesc: '',
          amountExpected: 0,
          clientEmail: '',
          clientIDNumber: '',
          clientMSISD: 0,
          clientName: '',
          pictureURL: '',
        },
  });

  if ('error' in paymentInfo) {
    toast.error(paymentInfo.error);
    dismissModal();
    return null;
  }

  const onSubmit = (paymentForm: PaymentForm) => {
    startTransition(() => {
      initiatePayment(paymentForm)
        .then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            toast.success(data.success);
            handleWindow(data.invoiceLink);
          }
        })
        .finally(handleDismiss);
    });
  };

  const invoicesExist =
    paymentInfo.existingInvoices && paymentInfo.existingInvoices.length >= 1;

  const title = invoicesExist
    ? 'Complete payment for this application'
    : 'Initiate payment for this application';

  const description = invoicesExist
    ? 'You can optionally enter the details of a different payee. If you are not directly responsible for making this payment'
    : 'We detected existing invoice links for this application. Complete this payment using these links, or initiate a new payment';

  const initiatePaymentForm = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-2"
      >
        <ReusableForm formFields={payApplicationFields} />
        <DialogFooter>
          <SubmitButton
            label="Initiate Payment"
            className="mt-4 flex-grow"
            isSubmitting={isPending}
          />
        </DialogFooter>
      </form>
    </Form>
  );

  const paymentTabs = (
    <Tabs defaultValue="existing" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="existing">Existing Invoice</TabsTrigger>
        <TabsTrigger value="new">Initiate Payment</TabsTrigger>
      </TabsList>
      <TabsContent value="existing">
        {paymentInfo.existingInvoices?.map(
          ({ createdAt, invoiceEmail, invoiceLink, invoiceNumber }) => {
            const formatedDate = format(createdAt, 'PPP');
            const highlightClass = 'font-semibold text-green-600';
            return (
              <Card key={invoiceNumber} className="px-4 py-3 space-y-2">
                <CardDescription>
                  This invoice, invoice no:{' '}
                  <span className={highlightClass}>{invoiceNumber}</span>, was
                  created on{' '}
                  <span className={highlightClass}>{formatedDate}</span> by{' '}
                  <span className={highlightClass}>{invoiceEmail}</span>
                </CardDescription>
                <Button
                  size="sm"
                  variant="custom"
                  onClick={() => handleWindow(invoiceLink)}
                >
                  Complete payment
                </Button>
              </Card>
            );
          },
        )}
      </TabsContent>
      <TabsContent value="new">{initiatePaymentForm}</TabsContent>
    </Tabs>
  );

  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col flex-grow space-y-2">
          <div className="flex flex-col flex-grow rounded-md border-2 border-green-200 px-4 py-2">
            <p className="font text-3xl font-semibold text-green-600">
              Ksh{' '}
              {paymentInfo.paymentDetails.amountExpected.toLocaleString(
                'en-US',
              )}
            </p>
          </div>
          <p className="text-xs">
            Inclusive of VAT, and eCitizen{' '}
            <span className="text-red-600 font-semibold">Ksh 50</span>{' '}
            convenience fee
          </p>
        </div>
        {invoicesExist ? paymentTabs : initiatePaymentForm}
      </DialogContent>
    </Dialog>
  );
};

export default PayApplication;
