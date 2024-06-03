'use server';
import { PageNavButton } from '@/components/buttons/page-nav-button';
import { currentRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { NavBarLinks } from '@/types/nav-links.types';
import { UserRole } from '@prisma/client';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const programRoutesPerRole = (
  isAdmin: boolean,
  programId: string,
): NavBarLinks[] => [
  {
    href: `/${programId}`,
    label: 'Program Summary',
  },
  ...(isAdmin
    ? ([
        {
          href: `/${programId}/update`,
          label: 'Update program',
        },
      ] as NavBarLinks[])
    : []),
  {
    href: `/${programId}/completed-programs`,
    label: 'Completed programs',
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
      <div className="relative m-0 h-36 lg:h-[200px] w-full p-0">
        <Image src="/newhero.jpg" fill alt="Hero image" />
        <div className="absolute inset-0 opacity-60 bg-gray-900 z-[8]" />
        <p className="absolute bottom-8 left-4 right-4 z-[10] text-lg md:text-2xl lg:text-4xl text-gray-100 font-bold">
          {heroTitle}
        </p>
      </div>
      <div className="flex flex-col items-start w-full bg-gray-200 border-b-2 lg:flex-row lg:items-center shadom-md border-b-gray-200">
        {programRoutes.map(({ href, label }, i) => (
          <PageNavButton key={`${i}${href}${label}`} {...{ href, label }} />
        ))}
      </div>
    </div>
  );
};

export default DescriptionTabs;
