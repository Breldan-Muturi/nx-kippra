import { CgMenuGridR } from 'react-icons/cg';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { MdClose } from 'react-icons/md';
import { SidebarProps } from '@/types/nav-links.types';

const MobileNav = ({ links, className, ...props }: SidebarProps) => {
  return (
    <div className={cn('justify-center', className)} {...props}>
      <Drawer>
        <DrawerTrigger>
          <CgMenuGridR color="white" size="28" className="my-2" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>
            {links.map(({ href, label, icon }, i) => (
              <Link
                key={`${i}-${href}-${label}`}
                href={href}
                title={`Access the ${label} page`}
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'md:hidden flex flex-col justify-center text-green-600',
                )}
              >
                <section className="flex items-center flex-row my-2 ">
                  <div className="flex ml-8 mr-2">{icon}</div>
                  <div className="w-1/2 font-semibold text-xl">{label}</div>
                </section>
              </Link>
            ))}
          </DrawerTitle>
          <DrawerClose>
            <Button variant="destructive">
              <MdClose size="18" color="white" />
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNav;
