"use client";
import { usePathname } from "next/navigation";
import React, { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { filterUserApplications } from "@/actions/applications/filter.applications.actions";
import { RemoveApplicationParams } from "@/validation/application.validation";
import { toast } from "sonner";
import { userRemoveApplication } from "@/actions/applications/user/remove.application.action";

const RemoveApplication = ({
  removeParams,
}: {
  removeParams: RemoveApplicationParams;
}) => {
  const { removeApplication, ...filterParams } = removeParams;
  const [isPending, startTransition] = useTransition();
  const path = usePathname();

  const handleDismiss = () => filterUserApplications({ path, ...filterParams });

  const dismissModal = () => {
    startTransition(() => {
      handleDismiss();
    });
  };

  const handleRemoveApplication = () => {
    startTransition(() => {
      userRemoveApplication(removeApplication)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            toast.success(data.success);
          }
        })
        .finally(handleDismiss);
    });
  };

  return (
    <AlertDialog open onOpenChange={dismissModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Remove yourself from this application?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Removing yourself from this application will invalidate your slot.
            The application fees due by the application owner will be adjusted
            accordingly. An email will be shared with the application owner
            notifying them of this update
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-red-600"
            onClick={handleRemoveApplication}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveApplication;
