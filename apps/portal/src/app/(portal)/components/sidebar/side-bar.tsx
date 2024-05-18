'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SidebarProps } from '@/types/nav-links.types';
import { LogOut, UserCog } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SideBarArea = ({ links, className, ...props }: SidebarProps) => {
  const path = usePathname();
  return (
    <aside
      className={cn(
        'flex flex-none flex-col bg-green-600 py-2 justify-start',
        className,
      )}
      {...props}
    >
      {links.map(({ href, label, icon, className, ...props }, i) => (
        <Link
          key={`${i}${href}${label}`}
          href={href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'justify-start text-gray-100 my-1 mx-2',
            path === href
              ? 'bg-background text-foreground font-semibold'
              : 'bg-green-600',
            className,
          )}
          {...props}
        >
          {icon}
          {label}
        </Link>
      ))}
      <div className="mx-4 mt-auto mb-2 space-y-3">
        <Link
          href="/settings"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'hidden md:flex justify-start text-sm mr-2 w-full',
          )}
        >
          <UserCog />
          <h5 className="ml-2 text-start">My account</h5>
        </Link>
        <Button
          type="submit"
          className="justify-start w-full gap-x-2"
          onClick={() => signOut()}
        >
          <LogOut />
          Log out
        </Button>
      </div>
    </aside>
  );
};

export default SideBarArea;
