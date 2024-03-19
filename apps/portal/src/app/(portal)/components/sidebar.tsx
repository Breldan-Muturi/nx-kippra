export type SideBarProps = React.HTMLAttributes<HTMLDivElement> & {
  links: {
    href: string;
    label: string;
    icon: ReactNode;
  }[];
};
import { CgMenuGridR } from "react-icons/cg";
import { signOut } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import React, { ReactNode } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { MdClose } from "react-icons/md"



const Sidebar = ({ links, className, ...props }: SideBarProps) => {
  return (
    <div
      className={cn(
        "flex flex-col bg-green-600 py-4 object-contain text-center  lg:px-3 md:col-span-1 overflow-x-hidden",
        className,
      )}
      {...props}
    >
      {links.map(({ href, label, icon }, i) => (
        <Link
          key={`${i}-${href}-${label}`}
          href={href}
          title={`Access the ${label} page`}
          className={cn(
            buttonVariants({ variant: "link" }),
            "hidden md:flex justify-start text-white text-sm mr-2 my-1 w-full",
          )}
        >
          {icon}
          <h5 className="w-1/2 text-start">{label}</h5>
        </Link>
      
      ))}
      <div className="md:hidden flex justify-center">
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
                    buttonVariants({ variant: "link" }),
                    "md:hidden flex flex-col justify-center text-green-600",
                  )}
                >
                 <section className="flex items-center flex-row w-full my-2 ">
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
      <form
        className="mt-auto"
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button
          variant="destructive"
          size="sm"
          type="submit"
          className="gap-x-2"
        >
          <LogOut />
        </Button>
      </form>
    </div>
  );
};

export default Sidebar;
