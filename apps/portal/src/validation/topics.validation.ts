import { z } from "zod";
import { characterCount, requiredField } from "./reusable.validation";

const topicsSchema = z.object({
  title: characterCount(6, 50),
  summary: characterCount(50, 350),
});

// Extend the topicsSchema by adding a required programId
export const addTopicsSchema = topicsSchema.extend({
  programId: requiredField,
});
export type AddTopicForm = z.infer<typeof addTopicsSchema>;

// Extend the topicsSchema by adding a required id
export const updateTopicsSchema = topicsSchema.extend({
  id: requiredField,
});
export type UpdateTopicForm = z.infer<typeof updateTopicsSchema>;
