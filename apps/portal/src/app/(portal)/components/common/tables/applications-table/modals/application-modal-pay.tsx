'use client';
import React, { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PaymentForm,
  paymentFormSchema,
} from '@/validation/payment/payment.validation';
import { Form } from '@/components/ui/form';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { initiatePayment } from '@/actions/payments/initiate.payment.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Card, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { payApplicationFields } from '@/validation/payment/payment-fields';
import { PayApplicationModal } from '../applications-table';

const PayApplication = ({
  handleDismiss,
  paymentInfo,
}: {
  handleDismiss: () => void;
  paymentInfo: PayApplicationModal;
}) => {
  const [isPending, startTransition] = useTransition();
  const handleWindow = (target: string) => window.open(target, '_blank');

  const form = useForm<PaymentForm>({
    mode: 'onChange',
    resolver: zodResolver(paymentFormSchema),
    defaultValues: paymentInfo.paymentDetails,
  });

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
            className="flex-grow mt-4"
            isSubmitting={isPending}
          />
        </DialogFooter>
      </form>
    </Form>
  );

  const paymentTabs = (
    <Tabs defaultValue="existing" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="existing">Existing Invoice</TabsTrigger>
        <TabsTrigger value="new">Initiate Payment</TabsTrigger>
      </TabsList>
      <TabsContent value="existing" className="space-y-3">
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
    <Dialog open onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col flex-grow space-y-2">
          <div className="flex flex-col flex-grow px-4 py-2 border-2 border-green-200 rounded-md">
            <p className="text-3xl font-semibold text-green-600 font">
              Ksh{' '}
              {paymentInfo.paymentDetails.amountExpected.toLocaleString(
                'en-US',
              )}
            </p>
          </div>
          <p className="text-xs">
            Inclusive of VAT, and eCitizen{' '}
            <span className="font-semibold text-red-600">Ksh 50</span>{' '}
            convenience fee
          </p>
        </div>
        {invoicesExist ? paymentTabs : initiatePaymentForm}
      </DialogContent>
    </Dialog>
  );
};

export default PayApplication;
