import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrganizationRole, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import React from 'react';
import OrganizationHero from './components/organization-hero';

type OrganizationLayoutProps = {
  children: React.ReactNode;
  params: { organizationId: string };
};
const OrganizationLayout = async ({
  children,
  params: { organizationId },
}: OrganizationLayoutProps) => {
  const id = await currentUserId();
  const [user, organization] = await Promise.all([
    db.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    }),
    db.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        users: { where: { user: { id } }, take: 1 },
      },
    }),
  ]);

  if (!user || !user.id || !user.role) return redirect('/account');

  if (!organization || !organization.id) return redirect('/organizations');

  if (
    user.role !== UserRole.ADMIN &&
    !organization.users.some(
      ({ userId, role }) =>
        userId === user.id && role === OrganizationRole.OWNER,
    )
  )
    return redirect('/organizations');

  return (
    <div className="w-full p-0">
      <OrganizationHero id={organization.id} />
      <div className="flex justify-center px-4 py-2">{children}</div>
    </div>
  );
};

export default OrganizationLayout;
