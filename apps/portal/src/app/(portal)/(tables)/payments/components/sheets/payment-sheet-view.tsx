'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { SinglePaymentReturnType } from '@/actions/payments/single.payment.actions';
import { ViewPaymentsRedirectType } from '@/validation/payment/payment.validation';
import { filterPayments } from '@/actions/payments/filter.payment.actions';

const PaymentSheetView = ({
  viewParams,
  payment,
}: {
  viewParams: ViewPaymentsRedirectType;
  payment: SinglePaymentReturnType;
}) => {
  const [isPending, startTransition] = useTransition();
  const path = usePathname();
  const handleDismiss = () =>
    filterPayments({
      ...viewParams,
      path,
    });
  const dismissModal = () => {
    startTransition(() => {
      handleDismiss();
    });
  };

  if ('error' in payment) {
    // Display the error and dismiss the sheet
    toast.error(payment.error);
    handleDismiss();
    return null;
  } else {
    // Later replace with a child component that accepts ApplicationParticipantReturn
    const paymentInfo = JSON.stringify(payment);
    return (
      <Sheet open onOpenChange={dismissModal}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>View Payment Details</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you are done.
            </SheetDescription>
          </SheetHeader>
          {paymentInfo}
          <SheetFooter>
            <Button type="submit" disabled={isPending}>
              Save changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }
};

export default PaymentSheetView;
