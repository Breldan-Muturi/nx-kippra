import { db } from "@/lib/db";
import { TrainingSession } from "@prisma/client";

export const getTopicsByProgramId = async (
    programId: string,
): Promise<TrainingSession[] | null> => {
    try {
        const sessions = await db.trainingSession.findMany({
            where: { programId },
        });
        return sessions;
    } catch {
        return null;
    }
};
