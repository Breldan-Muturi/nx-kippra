'use server';
import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnIdType } from '@/types/actions.types';
import {
  UpdateProgramImageFileType,
  UpdateProgramNoImageType,
  updateProgramNoImageSchema,
} from '@/validation/programs/program.validation';
import { UserRole } from '@prisma/client';
import {
  FilesUpload,
  deleteFiles,
  filesUpload,
} from '../firebase/storage.actions';

export type UpdateProgramType =
  | {
      formData?: FormData;
      data: UpdateProgramNoImageType;
    }
  | { data: UpdateProgramImageFileType };

export const updateProgram = async (
  values: UpdateProgramType,
): Promise<ActionReturnIdType> => {
  const userId = await currentUserId();
  if (!userId) return { error: 'Log in to update this program' };

  const validSubmission = updateProgramNoImageSchema.safeParse(values.data);
  if (!validSubmission.success) return { error: 'Invalid fields' };

  const { id, title, code, prerequisiteCourses, ...otherValues } =
    validSubmission.data;
  const [existingUser, programExist, titleExist, codeExists] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
      db.program.findUnique({
        where: { id },
        select: { id: true, image: { select: { filePath: true } } },
      }),
      db.program.findFirst({ where: { title }, select: { id: true } }),
      db.program.findFirst({ where: { code }, select: { id: true } }),
    ]);

  if (!existingUser || existingUser.role !== UserRole.ADMIN)
    return { error: 'You are not authorized to update this program' };
  if (!programExist || !programExist.id)
    return {
      error: 'Could not match existing program, please try again later',
    };
  if (titleExist && titleExist.id !== id)
    return { error: 'A program with this title already exists' };
  if (codeExists && codeExists.id !== id)
    return { error: 'A program with this code already exists' };

  let formData: FormData | undefined;
  let programImage: FilesUpload | undefined;

  if ('formData' in values) {
    formData = values.formData;
    const image = formData?.get('image') as File;
    if (!!image) {
      const [_, upload] = await Promise.all([
        !!programExist.image?.filePath
          ? deleteFiles([programExist.image.filePath])
          : Promise.resolve(undefined),
        filesUpload([image], `programs/${id}`),
      ]);
      if ('error' in upload) return { error: upload.error };
      programImage = upload[0];
    }
  }

  try {
    const updatedProgram = await db.program.update({
      where: { id },
      data: {
        title,
        code,
        ...otherValues,
        prerequisites: prerequisiteCourses
          ? { set: prerequisiteCourses.map((id) => ({ id })) }
          : { set: [] },
        image: programImage
          ? {
              upsert: {
                where: {
                  programId: id,
                },
                create: programImage,
                update: programImage,
              },
            }
          : undefined,
      },
    });
    return {
      success: 'Program updated successfully',
      recordId: updatedProgram.id,
    };
  } catch (error) {
    console.error('Error updating the program: ', error);
    return {
      error: 'There was an error updating the program, please try again later',
    };
  }
};
