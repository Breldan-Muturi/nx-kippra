"use client";

import React, { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface DialogFormConfirmationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  setOpen: (open: boolean) => void;
  label: string;
  title: string;
  description: string;
  dialogContent: React.ReactNode;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
}

const DialogFormConfirmation = ({
  open,
  setOpen,
  label,
  title,
  description,
  dialogContent,
  submitLabel,
  onSubmit,
  className,
  ...props
}: DialogFormConfirmationProps) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(() => {
      onSubmit();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={cn("sm:max-w-[425px]", className)} {...props}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {dialogContent}
        <DialogFooter>
          <Button
            variant="default"
            type="submit"
            className="bg-green-600 col-span-2"
            onClick={handleSubmit}
          >
            {isPending && (
              <Loader2 color="white" className="w-4 h-4 mr-2 animate-spin" />
            )}
            {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogFormConfirmation;
