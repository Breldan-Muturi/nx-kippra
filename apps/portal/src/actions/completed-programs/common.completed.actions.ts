'use server';
import { db } from '@/lib/db';
import { OrganizationRole } from '@prisma/client';

export const userPromise = async ({
  id,
  organizationIds,
}: {
  id: string;
  organizationIds: string[];
}) =>
  await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      _count: {
        select: {
          organizations: {
            where: {
              AND: [
                { role: OrganizationRole.OWNER },
                { organizationId: { in: organizationIds } },
              ],
            },
          },
        },
      },
    },
  });
export type UserPromise = Awaited<ReturnType<typeof userPromise>>;

export type SingleCompletedProgramArgs = {
  id: string;
  organizationIds: string[];
};
