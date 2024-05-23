'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NavBarLinks } from '@/types/nav-links.types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PageNavButton = ({ href, label }: NavBarLinks) => {
  const path = usePathname();
  const isActive = path === href;
  return (
    <Link
      key={`${href}${label}`}
      href={href}
      className={cn(
        buttonVariants({ variant: 'link' }),
        isActive && 'text-green-700 font-bold',
      )}
    >
      {label}
    </Link>
  );
};
