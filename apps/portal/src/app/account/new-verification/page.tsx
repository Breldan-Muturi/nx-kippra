"use client";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/account/new-verification.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, LogIn, LogOut, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonRedirectProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  icon: React.ReactNode;
}

const ButtonRedirect: React.FC<ButtonRedirectProps> = ({
  label,
  icon,
  className,
}) => (
  <Link
    href="/account"
    className={cn(
      buttonVariants({ variant: "default" }),
      "gap-x-2 bg-green-600",
      className,
    )}
  >
    {icon}
    {label}
  </Link>
);

const NewVerification = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Missing token!");
      return;
    }
    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong. Please try again later");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex w-3/5 flex-col space-y-4">
      {!success && !error && (
        <>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </>
      )}
      {success && (
        <>
          <div className="flex items-start space-x-4">
            <CheckCircle2
              fill="green"
              fillOpacity={0.3}
              className="h-12 w-12 border-green-600 text-green-600"
            />
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{success}</p>
              <p>Redirecting to your dashboard</p>
            </div>
          </div>
          <ButtonRedirect label="Contiue to Dashboard" icon={<LogIn />} />
        </>
      )}
      {error && (
        <>
          <div className="flex items-start space-x-4">
            <XCircle
              fill="red"
              fillOpacity={0.3}
              className="h-12 w-12 rounded-full border-red-600 text-red-600"
            />
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{error}</p>
              <p>Login to resend the email verification</p>
            </div>
          </div>
          <ButtonRedirect label="Return to Login" icon={<LogOut />} />
        </>
      )}
    </div>
  );
};

export default NewVerification;
