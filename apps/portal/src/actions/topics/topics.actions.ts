'use server';

import { getTopicById, getTopicByTitle } from '@/helpers/topics.helpers';
import { db } from '@/lib/db';
import { ActionReturnType } from '@/types/actions.types';
import {
  AddTopicForm,
  UpdateTopicForm,
  addTopicsSchema,
  updateTopicsSchema,
} from '@/validation/topics/topics.validation';

export const addTopic = async (
  data: AddTopicForm,
): Promise<ActionReturnType> => {
  const validTopic = addTopicsSchema.safeParse(data);
  if (!validTopic.success) {
    return { error: 'Invalid fields' };
  }
  const { programId, title, summary } = validTopic.data;
  const existingTopic = await getTopicByTitle(programId, title);
  if (existingTopic) {
    return { error: 'A topic with the same title already exists' };
  }
  try {
    await db.topic.create({
      data: {
        title,
        summary,
        programId,
      },
    });
    return { success: 'New topic added successfully' };
  } catch (error) {
    console.log(error);
    return { error: 'Something went wrong. Please try again later' };
  }
};

export const updateTopic = async (
  data: UpdateTopicForm,
): Promise<ActionReturnType> => {
  const validTopic = updateTopicsSchema.safeParse(data);
  if (!validTopic.success) return { error: 'Invalid fields' };

  const { id, title, summary } = validTopic.data;

  // Check that a topic with the id from validTopic.data exists
  const existingTopicById = await getTopicById(id);
  if (!existingTopicById) return { error: 'This topic id could not be found' };

  // Check if a topic with the same title exists for this programIId
  const existingTopicByTitle = await getTopicByTitle(
    existingTopicById.programId,
    title,
  );
  if (existingTopicByTitle && existingTopicByTitle.id !== id)
    return { error: 'This title is already in use.' };

  // Update only those fields of the validTopic.data that are different from the  existing one
  try {
    await db.topic.update({
      where: { id },
      data: {
        ...(title !== existingTopicById.title && { title }),
        ...(summary !== existingTopicById.summary && { summary }),
      },
    });
    return { success: 'Topic updated successfully' };
  } catch (error) {
    console.log(error);
    return { error: 'Error updating this topic. Please try again later' };
  }
};

export const deleteTopic = async (id: string): Promise<ActionReturnType> => {
  try {
    await db.topic.delete({ where: { id } });
    return { success: 'Topic deleted successfully' };
  } catch {
    return {
      error: 'There was an issue deleting this topic. Please try again later',
    };
  }
};
