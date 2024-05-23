'use server';

import { currentUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ActionReturnIdType } from '@/types/actions.types';
import {
  NewProgramImageUrl,
  NewProgramNoImageType,
  newProgramImageFileSchema,
  newProgramImageUrlSchema,
} from '@/validation/programs/program.validation';
import { UserRole } from '@prisma/client';
import { uploadFile } from '../firebase/storage.actions';

export type NewProgramType = {
  formData: FormData;
  data: NewProgramNoImageType;
};

export const newProgram = async ({
  formData,
  data,
}: NewProgramType): Promise<ActionReturnIdType> => {
  const userId = await currentUserId();
  const existingUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!existingUser || existingUser.role !== UserRole.ADMIN) {
    return { error: 'You are not authorized to add new programs' };
  }
  const image = formData.get('image') as File;

  const validFields = newProgramImageFileSchema.safeParse({
    ...data,
    image,
  });

  if (!validFields.success) {
    return { error: 'Invalid fields' };
  }

  const { name, type, title, code } = validFields.data.image;
  const [existingProgram, uploadReturn] = await Promise.all([
    db.program.count({
      where: {
        OR: [{ title }, { code }],
      },
    }),
    uploadFile({
      buffer: Buffer.from(await image.arrayBuffer()),
      contentType: type,
      fileName: name,
    }),
  ]);

  if (existingProgram > 0) {
    return { error: 'A program with this title or code already exists' };
  }

  if ('error' in uploadReturn) {
    return { error: uploadReturn.error };
  }

  const programWithImage: NewProgramImageUrl = newProgramImageUrlSchema.parse({
    ...validFields.data,
    imgUrl: uploadReturn.fileUrl,
  });

  const { prerequisiteCourses: prerequisites, ...newValidProgram } =
    programWithImage;

  try {
    const newProgram = await db.program.create({
      data: {
        ...newValidProgram,
        prerequisites: prerequisites
          ? {
              connect: prerequisites.map((id) => ({ id })),
            }
          : undefined,
      },
    });
    return {
      success: 'Course created successfully, redirecting to course page',
      recordId: newProgram.id,
    };
  } catch (error) {
    console.error('Error creating course', error);
    return {
      error: 'There was an error creating this program. Please try again later',
    };
  }
};
