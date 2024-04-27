'use server';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import { initApp } from './config';
import { ActionReturnType } from '@/types/actions.types';

export const uploadPDFile = async (
  buffer: Buffer,
  fileName: string,
): Promise<ActionReturnType> => {
  await initApp();
  const bucket = getStorage().bucket();
  const file = bucket.file(fileName);
  try {
    await file.save(buffer, {
      metadata: { contentType: 'application/pdf' },
    });
    const fileUrl = await getDownloadURL(file);
    return { success: fileUrl };
  } catch (error) {
    console.log('Firebase error: ', error);
    return { error: 'Error uploading file' };
  }
};

type UploadImageType = {
  contentType: Blob['type'];
  buffer: Buffer;
  fileName: string;
};
export type UploadImageReturn = { error: string } | { fileUrl: string };

export const uploadImage = async ({
  contentType,
  buffer,
  fileName,
}: UploadImageType): Promise<UploadImageReturn> => {
  await initApp();
  const bucket = getStorage().bucket();
  const file = bucket.file(fileName);
  try {
    await file.save(buffer, {
      metadata: { contentType },
    });
    const fileUrl = await getDownloadURL(file);
    return { fileUrl };
  } catch (error) {
    console.error('Error pushing image to Firebase: ', error);
    return { error: 'There was an error pushing the image to Firebase' };
  }
};
