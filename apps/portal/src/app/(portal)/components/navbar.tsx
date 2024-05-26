'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { avatarFallbackName } from '@/helpers/user.helper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';
import { DropDownLink, SidebarLink } from '@/types/nav-links.types';
import { LogOut, UserCog } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { buttonVariants } from '../../../components/ui/button';
import MobileNav from './sidebar/mobile-sidebar';

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

type NavBarProps = React.ComponentPropsWithRef<'div'> & {
  links: SidebarLink[];
};

const Navbar = ({ links, className, ...props }: NavBarProps) => {
  const user = useCurrentUser();

  return (
    <div
      className={cn('sticky top-0 w-full bg-white z-30', className)}
      {...props}
    >
      <div className="flex flex-row items-center justify-between w-full px-4 py-2 border border-b-gray-300">
        <div className="flex items-center w-1/2 space-x-1 md:w-1/4 lg:w-1/12">
          <MobileNav links={links} className="flex md:hidden" />
          <Link href="/" title="Navigate to home" className="flex flex-grow">
            <Image
              width={200}
              height={100}
              quality={100}
              src="/kippra_logo.png"
              alt="Kippra-logo"
            />
          </Link>
        </div>
        <nav className="items-center hidden lg:flex md:space-x-2 lg:space-x-4">
          {navLinks.map(({ href, label }, i) => (
            <Link
              key={`${i}-${href}`}
              href={href}
              title={`Visit the ${label} page`}
              className="text-base font-semibold text-muted-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center w-1/3 space-x-2 md:w-auto">
              <Avatar>
                <AvatarImage
                  src={`${user.image}`}
                  alt={`${user.name} profile image`}
                />
                <AvatarFallback>{avatarFallbackName(user.name)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold truncate text-muted-foreground">
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
