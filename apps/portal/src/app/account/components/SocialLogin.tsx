'use client';

import DividerWithText from '@/components/form/DividerWithText';
import { GoogleIcon } from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignInProvider } from '@/types/account.types';
import React from 'react';
import useLoginForm from '../hooks/use-login-form';

interface SocialButton {
  provider?: SignInProvider;
  icon: React.ReactNode;
  label: string;
}

const socialButtons: SocialButton[] = [
  {
    provider: 'google',
    icon: <GoogleIcon />,
    label: 'Continue with Google',
  },
  //TODO: Add eCitizen provider here
];

type SocialDiv = React.HTMLAttributes<HTMLElement>;

const SocialLogin: React.FC<SocialDiv> = ({ className }) => {
  const { handleSocialSignIn } = useLoginForm();
  return (
    <div className={cn('flex flex-col space-y-4 py-4', className)}>
      <DividerWithText dividerText="OR" />
      <div className="flex flex-col items-center justify-center w-full gap-y-2 lg:flex-row lg:gap-x-2">
        {socialButtons.map(({ provider, icon, label }, i) => {
          return (
            <Button
              key={`${i}-${label}`}
              size="lg"
              variant="outline"
              type="button"
              className="w-full gap-x-2"
              onClick={() => handleSocialSignIn(provider)}
            >
              {icon}
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialLogin;
