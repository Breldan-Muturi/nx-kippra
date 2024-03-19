import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type TrainingSessionApplicationData = Prisma.TrainingSessionGetPayload<{
  include: {
    program: {
      select: {
        title: true;
        prerequisites: {
          select: {
            title: true;
            id: true;
          };
        };
      };
    };
  };
}>;

export const getTrainingSessionApplicationData = async (
  id: string,
): Promise<TrainingSessionApplicationData | null> =>
  await db.trainingSession.findUnique({
    where: { id },
    include: {
      program: {
        select: {
          title: true,
          prerequisites: {
            select: {
              title: true,
              id: true,
            },
          },
        },
      },
    },
  });
