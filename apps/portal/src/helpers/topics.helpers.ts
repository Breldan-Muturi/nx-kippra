import { db } from "@/lib/db";
import { Topic } from "@prisma/client";

export const getTopicByTitle = async (
  programId: string,
  title: string,
): Promise<Topic | null> => {
  try {
    const existingTopic = await db.topic.findFirst({
      where: { title, programId },
    });
    return existingTopic;
  } catch {
    return null;
  }
};

export const getTopicsByProgramId = async (
  programId: string,
): Promise<Topic[] | null> => {
  try {
    const topics = await db.topic.findMany({
      where: { programId },
      orderBy: { updatedAt: "desc" },
    });
    return topics;
  } catch {
    return null;
  }
};

export const getTopicById = async (id: string): Promise<Topic | null> => {
  try {
    const topic = await db.topic.findUnique({ where: { id } });
    return topic;
  } catch {
    return null;
  }
};
