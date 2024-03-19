"use client";

import { SITE_TITLE } from "@/lib/constants";
import { Button, buttonVariants } from "../ui/button";
import { AlignJustify, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logout } from "@/actions/account/logout.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdAssessment } from "react-icons/md";
import { GiPadlock } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";

const navLinks = [
  {
    label: "About us",
    href: "https://kippra.or.ke",
  },
  {
    label: "Contact us",
    href: "https://kippra.or.ke",
  },
  {
    label: "Portal User Guide",
    href: "https://kippra.or.ke",
  },
  {
    label: "eLearning",
    href: "https://kippra.or.ke",
  },
];

const kippraLogo = (
  <Link href="/" title="Navigate to home" className="w-1/5">
    <Image
      width={200}
      height={100}
      quality={100}
      src="/static/images/kippra_logo.png"
      alt="Kippra-logo"
    />
  </Link>
);

interface NavBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Navbar = ({ className, ...props }: NavBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useCurrentUser();

  function getInitials(name: any) {
    const names = name.split(" ");
    const initials = names.map((n: string) => n[0].toUpperCase());
    return initials.join("");
  }

  const handleSignout = () => {
    logout();
  };
  const navLinkComponents = (
    <>
      {navLinks.map(({ href, label }, i) => (
        <Link
          key={`${i}-${href}`}
          href={href}
          title={`Visit the ${label} page`}
        >
          {label}
        </Link>
      ))}
      {user ? (
        <>
          <Link href="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src={`${user.image}`} alt="profile avatar" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              {user.role === "ADMIN" ? (
                <DropdownMenuContent>
                  <Link href="/dashboard">
                    <DropdownMenuItem>
                      <MdAssessment size="18" color="green" className="mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleSignout}
                    className="w-full"
                  >
                    <DropdownMenuItem>
                      <GiPadlock size="18" color="red" className="mr-2" />
                      logout
                    </DropdownMenuItem>
                  </Button>
                </DropdownMenuContent>
              ) : (
                <DropdownMenuContent>
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <FaUserCircle size="18" color="green" className="mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/profile/applications">
                    <DropdownMenuItem>
                      <MdLibraryBooks
                        size="18"
                        color="green"
                        className="mr-2"
                      />
                      Applications
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </Link>
          <p className="text-xs">Hi {user.name}</p>
        </>
      ) : (
        <Link
          href="/account"
          title="Sign up or login"
          className={buttonVariants({ variant: "custom" })}
        >
          SIGNUP OR LOGIN
        </Link>
      )}
    </>
  );

  return (
    <div className={cn("w-full bg-white", className)} {...props}>
      <div className="hidden w-full flex-row items-center justify-between border border-b-gray-300 px-4 py-2 md:flex">
        <div className="flex items-center justify-around md:w-[25%] lg:w-2/5">
          {kippraLogo}
          <h1 className="font-semibold text-green-600 md:text-base lg:text-base xl:text-2xl">
            {SITE_TITLE}
          </h1>
        </div>
        <nav className="flex  items-center font-semibold md:space-x-2 lg:space-x-4">
          {navLinkComponents}
        </nav>
      </div>
      <div className="relative w-full flex-col border border-b-gray-300 bg-white px-2 md:hidden">
        <div className="border-b-grey-300 flex w-full flex-row items-center  justify-between bg-white py-2 ">
          {kippraLogo}
          <Button onClick={() => setIsOpen(!isOpen)} variant="custom">
            {isOpen ? (
              <X size="24" color="white" />
            ) : (
              <AlignJustify size="24" color="white" />
            )}
          </Button>
        </div>
        {isOpen && (
          <div className="flex max-h-screen w-full flex-col space-y-5 border border-b-gray-300 p-10 font-semibold">
            <h1 className="text-center text-lg font-semibold text-green-600 ">
              {SITE_TITLE}
            </h1>
            {navLinkComponents}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
