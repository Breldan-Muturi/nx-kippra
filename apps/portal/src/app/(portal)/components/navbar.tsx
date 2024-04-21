'use client';

import { buttonVariants } from '../../../components/ui/button';
import { LogOut, UserCog } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropDownLink } from '@/types/nav-links.types';
import { avatarFallbackName } from '@/helpers/user.helper';
import { signOut } from 'next-auth/react';

const navLinks = [
  {
    label: 'About us',
    href: 'https://kippra.or.ke',
  },
  {
    label: 'Contact us',
    href: 'https://kippra.or.ke',
  },
  {
    label: 'Portal User Guide',
    href: 'https://kippra.or.ke',
  },
  {
    label: 'eLearning',
    href: 'https://kippra.or.ke',
  },
];

const dropDownLinks: DropDownLink[] = [
  {
    label: 'My account',
    href: '/settings',
    icon: <UserCog size="18" color="green" className="mr-2" />,
  },
];

const kippraLogo = (
  <Link href="/" title="Navigate to home" className="w-1/5">
    <Image
      width={200}
      height={100}
      quality={100}
      src="/static/images/kippra_logo.png"
      alt="Kippra-logo"
    />
  </Link>
);

interface NavBarProps extends React.ComponentPropsWithRef<'div'> {}

const Navbar = ({ className, ...props }: NavBarProps) => {
  const user = useCurrentUser();

  return (
    <div
      className={cn('sticky top-0 w-full bg-white z-30', className)}
      {...props}
    >
      <div className="flex w-full flex-row items-center justify-between border border-b-gray-300 px-4 py-2">
        <div className="flex items-center justify-around md:w-[25%] lg:w-2/5">
          {kippraLogo}
          <nav className="flex  items-center md:space-x-2 lg:space-x-4">
            {navLinks.map(({ href, label }, i) => (
              <Link
                key={`${i}-${href}`}
                href={href}
                title={`Visit the ${label} page`}
                className="text-muted-foreground font-semibold text-base"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex space-x-2 items-center">
              <Avatar>
                <AvatarImage
                  src={`${user.image}`}
                  alt={`${user.name} profile image`}
                />
                <AvatarFallback>{avatarFallbackName(user.name)}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground font-semibold">
                {user.name}
              </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {dropDownLinks.map(({ href, icon, label }) => (
                <React.Fragment key={`${href}${label}`}>
                  <Link href={href}>
                    <DropdownMenuItem>
                      {icon}
                      {label}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut size="18" color="red" className="mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/account"
            title="Sign up or login"
            className={buttonVariants({ variant: 'custom' })}
          >
            SIGNUP OR LOGIN
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
