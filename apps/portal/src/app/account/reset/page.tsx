"use client";
import FormHeader from "@/components/form/FormHeader";
import SubmitButton from "@/components/form/SubmitButton";
import { buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { reset } from "@/actions/account/reset.actions";
import { FormFieldType } from "@/types/form-field.types";
import { cn } from "@/lib/utils";
import {
  EmailValidationType,
  emailValidation,
} from "@/validation/account.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import AccountForm from "../components/AccountForm";

const resetFields: FormFieldType<EmailValidationType>[] = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your account email",
    type: "email",
    className: "col-span-2",
  },
];

const ResetPage = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<EmailValidationType>({
    resolver: zodResolver(emailValidation),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<EmailValidationType> = (values) => {
    startTransition(() => {
      reset(values).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
        }
      });
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-4/5 flex-col space-y-4 md:w-3/5"
      >
        <FormHeader
          label="Enter your email"
          description="To initiate a password reset & regain access to your account"
        />
        <AccountForm accountFields={resetFields} />
        <SubmitButton label="Send reset email" isSubmitting={isPending} />
        <Link
          href="/account"
          className={cn(
            buttonVariants({ variant: "link" }),
            "h-4 justify-start p-0 text-sm font-semibold text-green-600",
          )}
        >
          Back to Login
        </Link>
      </form>
    </Form>
  );
};

export default ResetPage;
