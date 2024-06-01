'use client';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CheckCircle2, LogIn, LogOut, XCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import useNewVerification from '../hooks/use-new-verification';

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
      buttonVariants({ variant: 'default' }),
      'gap-x-2 bg-green-600',
      className,
    )}
  >
    {icon}
    {label}
  </Link>
);

const NewVerification = () => {
  const { error, success } = useNewVerification();
  return (
    <div className="flex flex-col w-3/5 space-y-4">
      {!success && !error && (
        <>
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
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
              className="w-12 h-12 text-green-600 border-green-600"
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
              className="w-12 h-12 text-red-600 border-red-600 rounded-full"
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
