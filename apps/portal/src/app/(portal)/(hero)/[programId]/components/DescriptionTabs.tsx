'use server';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { currentRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import React from 'react';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const programRoutesPerRole = (
  isAdmin: boolean,
  programId: string,
): { href: string; label: string }[] => {
  let routes = [
    {
      href: `/${programId}`,
      label: 'Program Summary',
    },
    {
      href: `/${programId}/topics`,
      label: 'Topics',
    },
    {
      href: `/${programId}/training-sessions`,
      label: 'Training Sessions',
    },
  ];
  if (isAdmin) {
    routes.push({
      href: `/${programId}/update`,
      label: 'Update program',
    });
  }

  return routes;
};

const DescriptionTabs = async ({ programId }: { programId: string }) => {
  const isAdmin = (await currentRole()) === UserRole.ADMIN;
  const programRoutes = programRoutesPerRole(isAdmin, programId);
  const programTitle = await db.program.findUnique({
    where: { id: programId },
    select: { title: true },
  });
  if (!programTitle) redirect('/');
  const heroTitle = programTitle.title;
  return (
    <div className="flex flex-col w-full">
      <div className="relative m-0 h-[200px] w-full p-0">
        <Image src="/newhero.jpg" fill alt="Hero image" />
        <div className="absolute inset-0 opacity-60 bg-gray-900 z-[8]" />
        <p className="absolute bottom-8 left-4 right-4 z-[10] text-4xl text-gray-100 font-bold">
          {heroTitle}
        </p>
      </div>
      <div className="flex items-center w-full bg-gray-200 border-b-2 shadom-md border-b-gray-200">
        {programRoutes.map(({ href, label }, i) => (
          <Link
            key={`${i}-${href}`}
            href={href}
            className={buttonVariants({ variant: 'link' })}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DescriptionTabs;
