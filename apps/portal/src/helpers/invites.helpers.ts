'use server';

import { db } from '@/lib/db';

export const getOrganizationInvite = async ({
  email,
  organizationId,
}: {
  email: string;
  organizationId: string;
}) =>
  await db.inviteOrganization.findFirst({
    where: { AND: [{ email }, { organizationId }] },
  });
