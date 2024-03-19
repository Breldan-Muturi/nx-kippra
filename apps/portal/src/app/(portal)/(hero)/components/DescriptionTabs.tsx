"use server";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import React from "react";

const programRoutesPerRole = (
  isAdmin: boolean,
  programId: string,
): { href: string; label: string }[] => {
  let routes = [
    {
      href: `/${programId}`,
      label: "Program Summary",
    },
    {
      href: `/${programId}/topics`,
      label: "Topics",
    },
    {
      href: `/${programId}/training-sessions`,
      label: "Training Sessions",
    },
  ];
  if (isAdmin) {
    routes.push({
      href: `/${programId}/update`,
      label: "Update program",
    });
  }

  return routes;
};

const DescriptionTabs = async ({ programId }: { programId: string }) => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  const programRoutes = programRoutesPerRole(isAdmin, programId);
  return (
    <div className="relative m-0 h-[350px] w-full p-0">
      <Image src="/newhero.jpg" fill alt="Hero image" />
      <div className="shadom-md absolute bottom-0 left-0 right-0 z-[10] flex w-full items-center border-b-2 border-b-gray-200 bg-gray-200">
        {programRoutes.map(({ href, label }, i) => (
          <Link
            key={`${i}-${href}`}
            href={href}
            className={buttonVariants({ variant: "link" })}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DescriptionTabs;
