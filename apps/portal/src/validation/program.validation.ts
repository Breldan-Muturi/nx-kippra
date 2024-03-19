import { z } from "zod";
import { characterCount } from "./reusable.validation";

export const newProgramSchema = z.object({
  imgUrl: z.string().nullable().optional(),
  title: characterCount(8, 50),
  code: characterCount(3, 6),
  summary: characterCount(50, 350).nullable().optional(),
  prerequisiteCourses: z.array(z.string()).nullable().optional(),
  serviceId: z.number().refine((num) => num.toString().length === 7, {
    message: "Number must be 7 digits long",
  }),
  moodleCourseId: z.number().optional(),
});
export type NewProgramForm = z.infer<typeof newProgramSchema>;

export const updateProgramSchema = newProgramSchema
  .partial()
  .extend({ id: z.string() });
export type UpdateProgramForm = z.infer<typeof updateProgramSchema>;
