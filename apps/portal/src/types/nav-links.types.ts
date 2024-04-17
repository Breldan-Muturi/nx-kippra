import { UserRole } from '@prisma/client';

export type IconProps = React.HTMLAttributes<SVGElement>;

export type SidebarLink = React.ComponentPropsWithoutRef<'a'> & {
  href: string;
  label: string;
  icon: React.ReactNode;
  role?: UserRole;
};

export type SidebarProps = React.ComponentPropsWithoutRef<'aside'> & {
  links: SidebarLink[];
};
