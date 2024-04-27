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
import { ViewApplicationSheet } from '../applications-table';

const ApplicationSheet = ({
  handleDismiss,
  application,
}: {
  handleDismiss: () => void;
  application: ViewApplicationSheet;
}) => {
  return (
    <Sheet open onOpenChange={handleDismiss}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Application Details</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        {JSON.stringify(application)}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ApplicationSheet;
