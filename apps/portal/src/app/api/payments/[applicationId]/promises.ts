import { db } from '@/lib/db';

export const applicationPromise = async ({
  id,
  invoiceNumber,
}: {
  id: string;
  invoiceNumber: string;
}) =>
  await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      payment: { select: { id: true } },
      invoice: {
        where: { invoiceNumber },
        select: { id: true, invoiceNumber: true },
      },
      trainingSession: {
        select: {
          startDate: true,
          endDate: true,
          program: { select: { title: true } },
        },
      },
      owner: { select: { email: true } },
      applicationFee: true,
    },
  });
export type ApplicationPromise = Awaited<ReturnType<typeof applicationPromise>>;
