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
import { DefaultApplicationParams } from '@/validation/applications/user.application.validation';
import { usePathname } from 'next/navigation';
import {
  filterAdminApplications,
  filterUserApplications,
} from '@/actions/applications/filter.applications.actions';
import { ViewApplicationReturnType } from '@/actions/applications/user/single.application.action';
import { toast } from 'sonner';

const ApplicationSheet = ({
  viewParams,
  application,
  isAdmin,
}: {
  viewParams: DefaultApplicationParams;
  application: ViewApplicationReturnType;
  isAdmin: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const path = usePathname();
  const handleDismiss = () =>
    isAdmin
      ? filterAdminApplications({ path, ...viewParams })
      : filterUserApplications({ path, ...viewParams });
  const dismissModal = () => {
    startTransition(() => {
      handleDismiss();
    });
  };
  let applicationInfo: string | undefined;
  if ('error' in application) {
    // Display the error and dismiss the sheet
    toast.error(application.error);
    handleDismiss();
    return null;
  } else if (application.isApplicationAdmin) {
    // Later replace with a child component that accepts ApplicationParticipantReturn
    applicationInfo = JSON.stringify(application);
  } else {
    // Later replace with a child component that accepts ApplicationAdminReturn
    applicationInfo = JSON.stringify(application);
  }
  return (
    <Sheet open onOpenChange={dismissModal}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Application Details</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        {applicationInfo}
        <SheetFooter>
          <Button type="submit" disabled={isPending}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ApplicationSheet;
