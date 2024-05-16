'use client';
import { PayeeApplicationModal } from '@/actions/applications/user/pay.application.actions';
import { initiatePayment } from '@/actions/payments/initiate.payment.actions';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import { Button } from '@/components/ui/button';
import { Card, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { payApplicationFields } from '@/validation/payment/payment-fields';
import {
  PaymentForm,
  paymentFormSchema,
} from '@/validation/payment/payment.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const PayApplication = ({
  handleDismiss,
  paymentInfo,
}: {
  handleDismiss: () => void;
  paymentInfo: PayeeApplicationModal;
}) => {
  const { currency, existingInvoices, paymentDetails } = paymentInfo;
  const [isPending, startTransition] = useTransition();
  const handleWindow = (target: string) => window.open(target, '_blank');

  const form = useForm<PaymentForm>({
    mode: 'onChange',
    resolver: zodResolver(paymentFormSchema),
    defaultValues: paymentDetails,
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

  const invoicesExist = existingInvoices && existingInvoices.length >= 1;

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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="existing">Existing Invoice</TabsTrigger>
        <TabsTrigger value="new">Initiate Payment</TabsTrigger>
      </TabsList>
      <TabsContent value="existing" className="space-y-3">
        {existingInvoices?.map(
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

  const usingUsd = currency === 'KES';
  const amountToShow = usingUsd
    ? paymentDetails.amountExpected + 50
    : paymentDetails.amountExpected + 1;

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
              {currency} {amountToShow.toLocaleString('en-US')}
            </p>
          </div>
          <p className="text-xs">
            Inclusive of VAT, and eCitizen{' '}
            <span className="font-semibold text-red-600">
              {usingUsd ? 'Kes 50' : 'Usd 1'}
            </span>{' '}
            convenience fee
          </p>
        </div>
        {invoicesExist ? paymentTabs : initiatePaymentForm}
      </DialogContent>
    </Dialog>
  );
};

export default PayApplication;
