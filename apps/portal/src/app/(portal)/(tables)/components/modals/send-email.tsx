"use client";
import { usePathname } from "next/navigation";
import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filterAdminApplications } from "@/actions/applications/filter.applications.actions";
import { EmailApplicationParams } from "@/validation/application.validation";
import { adminSendEmail } from "@/actions/applications/admin.applications.actions";
import { toast } from "sonner";

const SendEmail = ({
  emailParams,
}: {
  emailParams: EmailApplicationParams;
}) => {
  const { sendEmail, ...filterParams } = emailParams;
  const [isPending, startTransition] = useTransition();
  const path = usePathname();
  const handleDismiss = () =>
    filterAdminApplications({ path, ...filterParams });

  const dismissModal = () => {
    startTransition(() => {
      handleDismiss();
    });
  };

  const handleSendEmail = () => {
    startTransition(() => {
      adminSendEmail(sendEmail)
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
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmail;
