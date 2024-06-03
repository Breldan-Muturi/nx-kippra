'use client';
import MobileSidebarLink from '@/components/buttons/mobile-sidebar-link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { SidebarProps } from '@/types/nav-links.types';
import { PanelBottomClose, PanelBottomOpen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';

const MobileNav = ({ links, navLinks, className, ...props }: SidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('justify-center', className)} {...props}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger>
          {open ? (
            <PanelBottomClose color="gray" size="28" className="my-2" />
          ) : (
            <PanelBottomOpen color="gray" size="28" className="my-2" />
          )}
        </DrawerTrigger>
        <DrawerContent>
          {links.map(({ href, label, icon }, i) => (
            <MobileSidebarLink
              key={`${i}${href}${label}`}
              {...{ href, label, icon }}
            />
          ))}
          <Accordion type="single" collapsible className="w-full p-4">
            <AccordionItem value="navlinks">
              <AccordionTrigger>External links</AccordionTrigger>
              <AccordionContent className="flex flex-col items-start space-y-2">
                {navLinks.map(({ href, label }) => (
                  <Link
                    href={href}
                    key={`${label}${href}`}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      'h-9 justify-start w-full',
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DrawerClose
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'justify-start w-full text-red-600 border-0 rounded-none gap-x-2',
            )}
          >
            <MdClose size="18" color="red" />
            Dismiss modal
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNav;
