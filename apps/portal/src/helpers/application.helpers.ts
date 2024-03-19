import { db } from "@/lib/db";

export const getApplicationConfirmationTokens = async (
  email: string,
  trainingSessionId: string,
) => {
  try {
    const applicationConfirmationToken =
      await db.applicationConfirmationToken.findFirst({
        where: {
          trainingSessionId,
          email,
        },
      });
    return applicationConfirmationToken;
  } catch {
    return null;
  }
};

export const getApplicationById = async (id: string) => {
  try {
    const application = await db.application.findUnique({ where: { id } });
    return application;
  } catch {
    return null;
  }
};
