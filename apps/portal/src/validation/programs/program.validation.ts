import { z } from 'zod';
import {
  characterCount,
  validImageUpload,
  validString,
} from '../reusable.validation';

const validServiceId = z
  .number()
  .positive()
  .refine((num) => num.toString().length === 7, {
    message: 'Number must be 7 digits long',
  });

export const newProgramNoImageSchema = z.object({
  title: characterCount(8, 200),
  code: characterCount(3, 6),
  summary: z.string().optional(),
  prerequisiteCourses: z.array(z.string()).optional(),
  serviceId: validServiceId,
  serviceIdUsd: validServiceId,
  moodleCourseId: z.number().optional(),
});
export type NewProgramNoImageType = z.infer<typeof newProgramNoImageSchema>;
export const updateProgramNoImageSchema = newProgramNoImageSchema.extend({
  id: validString('Program Id missing'),
});
export type UpdateProgramNoImageType = z.infer<
  typeof updateProgramNoImageSchema
>;

export const newProgramImageFileSchema = newProgramNoImageSchema.extend({
  image: validImageUpload(false),
});
export type NewProgramImageFileType = z.infer<typeof newProgramImageFileSchema>;
export const updateProgramImageFileSchema = newProgramImageFileSchema.extend({
  id: validString('Program Id missing'),
});
export type UpdateProgramImageFileType = z.infer<
  typeof updateProgramImageFileSchema
>;

export const newProgramImageUrlSchema = newProgramNoImageSchema.extend({
  imgUrl: z.string().optional(),
});
export type NewProgramImageUrl = z.infer<typeof newProgramImageUrlSchema>;
export const updateProgramImageUrlSchema = newProgramImageUrlSchema.extend({
  id: validString('Program Id missing'),
});
export type UpdateProgramImageUrlType = z.infer<
  typeof updateProgramImageUrlSchema
>;
