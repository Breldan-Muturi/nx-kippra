"use client";
import { usePathname } from "next/navigation";
import React, { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { filterAdminApplications } from "@/actions/applications/filter.applications.actions";
import { DefaultApplicationParams } from "@/validation/application.validation";
import { FormFieldType } from "@/types/form-field.types";
import {
  ApplicationPaymentDetails,
  PaymentForm,
  pesaflowCheckoutSchema,
} from "@/validation/payment.validation";
import { Form } from "@/components/ui/form";
import ReusableForm from "@/components/form/ReusableForm";
import SubmitButton from "@/components/form/SubmitButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PayApplicationReturnType } from "@/actions/applications/user/pay.application.actions";
import { toast } from "sonner";

const payApplicationFields: FormFieldType<PaymentForm>[] = [
  {
    name: "clientName",
    type: "text",
    label: "Payee full name",
    placeholder: "eg. Ms. Anne Wanjiku",
  },
  {
    name: "clientIDNumber",
    type: "text",
    label: "Payee ID/Passport Number",
    placeholder: "eg. 331331331",
  },
  {
    name: "clientMSISD",
    type: "number",
    label: "Payee Phone Number",
    placeholder: "eg. 254711223344",
    minValue: 1,
  },
  {
    name: "clientEmail",
    type: "email",
    label: "Payee email",
    placeholder: "eg. payee@email.com",
  },
];

const PayApplication = ({
  payParams,
  // paymentDetails,
  paymentInfo,
}: {
  payParams: DefaultApplicationParams;
  // paymentDetails: ApplicationPaymentDetails;
  paymentInfo: PayApplicationReturnType;
}) => {
  const [isPending, startTransition] = useTransition();
  const path = usePathname();
  const handleDismiss = () => filterAdminApplications({ path, ...payParams });

  const dismissModal = () => {
    startTransition(() => {
      handleDismiss();
    });
  };

  // Initialize default values
  const defaultValues = {
    applicationId: "",
    billDesc: "",
    amountExpected: 0,
    clientEmail: "",
    clientIDNumber: "",
    clientMSISD: 0,
    clientName: "",
    pictureURL: "",
  };

  const form = useForm<PaymentForm>({
    mode: "onChange",
    resolver: zodResolver(pesaflowCheckoutSchema),
    defaultValues,
  });

  if ("error" in paymentInfo) {
    toast.error(paymentInfo.error);
    dismissModal();
    return null;
  } else {
    // If there is no error we reassign the default values
    Object.assign(defaultValues, paymentInfo.paymentDetails);
  }

  const onSubmit = () => {
    startTransition(() => {});
  };

  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Initiate payment for this application</DialogTitle>
          <DialogDescription>
            You can optionally enter the details of a different payee. If you
            are not directly responsible for making this payment
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-grow rounded-md border-2 border-green-200 px-4 py-2">
          <p className="font text-3xl font-semibold text-green-600">
            Ksh{" "}
            {paymentInfo.paymentDetails.amountExpected.toLocaleString("en-US")}
          </p>
        </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default PayApplication;