'use server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const programsOptionsPromise = async (
  where?: Prisma.ProgramWhereInput,
) =>
  await db.program.findMany({
    where,
    select: {
      id: true,
      title: true,
      code: true,
      image: { select: { fileUrl: true } },
    },
  });
export type ProgramsOptionsPromise = Awaited<
  ReturnType<typeof programsOptionsPromise>
>;
export type ProgramsOption = ProgramsOptionsPromise[number];
