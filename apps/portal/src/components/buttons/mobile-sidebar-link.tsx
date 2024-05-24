'use client';
import { cn } from '@/lib/utils';
import { SidebarLink } from '@/types/nav-links.types';
import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '../ui/button';

type MobileSidebarLinkProps = LinkProps & SidebarLink;

const MobileSidebarLink = ({ href, icon, label }: MobileSidebarLinkProps) => {
  const path = usePathname();
  const isActive = href === '/' ? path === '/' : path.startsWith(href);

  return (
    <Link
      href={href}
      title={`Access the ${label} page`}
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'gap-x-2 items-center justify-start w-full rounded-none',
        isActive && 'font-semibold text-green-600',
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

export default MobileSidebarLink;
