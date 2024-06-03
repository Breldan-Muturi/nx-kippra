import { UserRole } from '@prisma/client';
import { LinkProps } from 'next/link';

export type IconProps = React.HTMLAttributes<SVGElement>;

export type ExternalNav = React.ComponentPropsWithoutRef<'a'> &
  LinkProps & {
    label: string;
  };

export type SidebarLink = ExternalNav & {
  icon: React.ReactNode;
  role?: UserRole;
};

export type SidebarProps = React.ComponentPropsWithoutRef<'aside'> & {
  links: SidebarLink[];
  navLinks: ExternalNav[];
};

export type NavBarLinks = {
  label: string;
  href: string;
};

export type DropDownLink = SidebarLink;
