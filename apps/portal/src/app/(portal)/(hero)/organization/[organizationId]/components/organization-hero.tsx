import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarFallbackName } from '@/helpers/user.helper';
import { db } from '@/lib/db';
import { NavBarLinks } from '@/types/nav-links.types';
import Image from 'next/image';
import { OrgLink } from './organization-nav-links';

const OrganizationHero = async ({ id }: { id: string }) => {
  const heroInfo = await db.organization.findUnique({
    where: { id },
    select: { name: true, image: true },
  });
  const heroImage = heroInfo?.image;
  const heroTitle = heroInfo?.name;

  const organizationRoutes: NavBarLinks[] = [
    {
      href: `/organization/${id}`,
      label: 'Update organization',
    },
    {
      href: `/organization/${id}/applications`,
      label: 'Applications',
    },
    {
      href: `/organization/${id}/payments`,
      label: 'Payments',
    },
    {
      href: `/organization/${id}/members`,
      label: 'Members',
    },
    {
      href: `organization/${id}/completed-programs`,
      label: 'Completed programs',
    },
    {
      href: `/organization/${id}/invites`,
      label: 'Invites',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="relative m-0 h-52 w-full p-0">
        <Image src="/newhero.jpg" fill alt="KIPPRA hero image" />
        <div className="absolute inset-0 bg-gray-900/60 z-10" />
        <div className="absolute flex space-x-4 items-center bottom-8 left-4 right-4 z-20">
          <Avatar className="size-20 ring-4 ring-green-600/60">
            <AvatarImage
              src={heroImage || undefined}
              alt={`${heroTitle || 'Organization'}'s profile image`}
            />
            <AvatarFallback>
              {heroTitle ? avatarFallbackName(heroTitle) : 'NA'}
            </AvatarFallback>
          </Avatar>
          {heroTitle && (
            <p className="text-4xl text-background font-bold">{heroTitle}</p>
          )}
        </div>
      </div>
      <div className="shadow-md flex w-full items-center border-b-2 border-b-gray-200 bg-gray-200">
        {organizationRoutes.map(({ href, label }) => (
          <OrgLink key={`${href}${label}`} {...{ href, label }} />
        ))}
      </div>
    </div>
  );
};

export default OrganizationHero;
