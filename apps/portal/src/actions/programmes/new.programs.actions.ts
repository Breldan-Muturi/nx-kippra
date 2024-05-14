'use server';

import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { FormError } from '@/types/actions.types';
import {
  NewProgramImageFileType,
  NewProgramImageUrl,
  NewProgramNoImageType,
  newProgramImageUrlSchema,
  newProgramNoImageSchema,
} from '@/validation/programs/program.validation';
import { UserRole } from '@prisma/client';
import { uploadFile } from '../firebase/storage.actions';

export type NewProgramType = {
  formData: FormData;
  data: NewProgramNoImageType;
};

type NewProgramReturn =
  | {
      error: string;
      formErrors?: FormError<NewProgramImageFileType>[];
    }
  | { success: string; recordId: string };

export const newProgram = async ({
  formData,
  data,
}: NewProgramType): Promise<NewProgramReturn> => {
  const user = await currentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return { error: 'You are not authorized to add new programs' };
  }
  const image = formData.get('image') as File;

  const validFields = newProgramNoImageSchema.safeParse(data);

  if (!validFields.success) {
    return { error: 'Invalid fields' };
  }

  const { title, code, serviceId, serviceIdUsd } = validFields.data;

  const [existingProgram, uploadReturn] = await Promise.all([
    db.program.findFirst({
      where: {
        OR: [{ title }, { code }, { serviceId }, { serviceIdUsd }],
      },
      select: { title: true, code: true, serviceId: true, serviceIdUsd: true },
    }),
    uploadFile({
      buffer: Buffer.from(await image.arrayBuffer()),
      contentType: image.type,
      fileName: image.name,
    }),
  ]);
  let formErrors: FormError<NewProgramImageFileType>[] = [];
  if (existingProgram) {
    if (existingProgram.code === code) {
      formErrors = [
        ...formErrors,
        { field: 'code', message: 'A program with this code already exists' },
      ];
    }
    if (existingProgram.title === title) {
      formErrors = [
        ...formErrors,
        { field: 'title', message: 'A program with this title already exists' },
      ];
    }
    if (existingProgram.serviceId === serviceId) {
      formErrors = [
        ...formErrors,
        {
          field: 'serviceId',
          message: 'A program with this service id (KES) already exists',
        },
      ];
    }
    if (existingProgram.serviceIdUsd === serviceIdUsd) {
      formErrors = [
        ...formErrors,
        {
          field: 'serviceIdUsd',
          message: 'A program with this service id (USD) already exists',
        },
      ];
    }
    return {
      error: 'A similar program already exists',
      formErrors,
    };
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
