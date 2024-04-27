'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PaymentDetailsType } from '@/actions/payments/single.payment.actions';

const PaymentSheetView = ({
  handleDismiss,
  paymentDetails,
}: {
  handleDismiss: () => void;
  paymentDetails: PaymentDetailsType;
}) => {
  return (
    <Sheet open onOpenChange={handleDismiss}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Payment Details</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        {JSON.stringify(paymentDetails)}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentSheetView;
