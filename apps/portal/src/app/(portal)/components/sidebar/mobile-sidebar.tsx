import MobileSidebarLink from '@/components/buttons/mobile-sidebar-link';
import { buttonVariants } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { SidebarProps } from '@/types/nav-links.types';
import { CgMenuGridR } from 'react-icons/cg';
import { MdClose } from 'react-icons/md';

const MobileNav = ({ links, className, ...props }: SidebarProps) => {
  return (
    <div className={cn('justify-center', className)} {...props}>
      <Drawer>
        <DrawerTrigger>
          <CgMenuGridR color="gray" size="28" className="my-2" />
        </DrawerTrigger>
        <DrawerContent>
          {/* <DrawerTitle> */}
          {links.map(({ href, label, icon }, i) => (
            <MobileSidebarLink
              {...{ key: `${i}${href}${label}`, href, label, icon }}
            />
          ))}
          {/* </DrawerTitle> */}
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
