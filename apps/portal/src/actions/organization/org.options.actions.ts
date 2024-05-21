'use server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const organizationPromise = async (
  where?: Prisma.OrganizationWhereInput,
) =>
  await db.organization.findMany({
    where,
    select: {
      id: true,
      name: true,
      image: { select: { fileUrl: true } },
      county: true,
    },
  });
export type OrganizationPromise = Awaited<
  ReturnType<typeof organizationPromise>
>;
export type OrgOption = OrganizationPromise[number];
