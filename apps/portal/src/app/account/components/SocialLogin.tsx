"use client";

import DividerWithText from "@/components/form/DividerWithText";
import { GoogleIcon } from "@/components/icons/google";
import { FacebookIcon } from "@/components/icons/facebook";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { BuiltInProviderType } from "next-auth/providers";
import { LiteralUnion, signIn } from "next-auth/react";
import React from "react";
import { useSearchParams } from "next/navigation";

type SignInProvider = LiteralUnion<BuiltInProviderType> | undefined;

interface SocialButton {
  provider: SignInProvider;
  icon: React.ReactNode;
  label: string;
}

const socialButtons: SocialButton[] = [
  {
    provider: "google",
    icon: <GoogleIcon />,
    label: "Continue with Google",
  },
  {
    provider: "facebook",
    icon: <FacebookIcon />,
    label: "Continue with Facebook",
  },
];

type SocialDiv = React.HTMLAttributes<HTMLElement>;

const SocialLogin: React.FC<SocialDiv> = ({ className }) => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleSocialSignIn = (provider: SignInProvider) => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  };
  return (
    <div className={cn("flex flex-col space-y-4 py-4", className)}>
      <DividerWithText dividerText="OR" />
      <div className="flex flex-col items-center justify-center w-full gap-y-2 md:flex-row md:gap-x-2">
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
