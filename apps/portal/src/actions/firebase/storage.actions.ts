'use server';
import { ActionReturnType } from '@/types/actions.types';
import { FilePreviewSchema } from '@/validation/reusable.validation';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import path from 'path';
import { initApp } from './config';

export type FilesUpload = {
  fileUrl: string;
  filePath: string;
  contentType: string;
  size: number;
};
export type FilesUploadReturn = { error: string } | FilesUpload[];

export const filesUpload = async (
  files: File[],
  path: string,
): Promise<FilesUploadReturn> => {
  await initApp();
  const bucket = getStorage().bucket();
  try {
    const uploadPromises = files.map(async (file) => {
      const filePath = `${path}/${file.name}`;
      const upload = bucket.file(filePath);
      const buffer = Buffer.from(await file.arrayBuffer());
      await upload.save(buffer, {
        metadata: { contentType: file.type },
      });
      const [[metadata], fileUrl] = await Promise.all([
        upload.getMetadata(),
        getDownloadURL(upload),
      ]);
      return {
        fileUrl,
        filePath,
        contentType: metadata.contentType || '',
        size: Number(metadata.size) || 0,
      };
    });
    return await Promise.all(uploadPromises);
  } catch (e) {
    console.error('Error uploading files to Firebase: ', e);
    return {
      error:
        'Failed to upload files due to a server error. Please try again later',
    };
  }
};

export type PDFUpload = { buffer: Buffer; fileName: string };
export const pdfsUpload = async (
  pdfUploads: PDFUpload[],
  path: string,
): Promise<FilesUploadReturn> => {
  await initApp();
  const bucket = getStorage().bucket();
  try {
    const pdfPromises = pdfUploads.map(async (pdfUpload) => {
      const filePath = `${path}/${pdfUpload.fileName}`;
      const file = bucket.file(filePath);
      await file.save(pdfUpload.buffer, {
        metadata: { contentType: 'application/pdf' },
      });
      const [[metadata], fileUrl] = await Promise.all([
        file.getMetadata(),
        getDownloadURL(file),
      ]);
      return {
        fileUrl,
        filePath,
        contentType: metadata.contentType || '',
        size: Number(metadata.size) || 0,
      };
    });
    return await Promise.all(pdfPromises);
  } catch (e) {
    console.error('Error uploading files to firebase: ', e);
    return {
      error:
        'Failed to upload files due to a server error. Please try again later',
    };
  }
};

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

type UploadFileType = {
  contentType: Blob['type'];
  buffer: Buffer;
  fileName: string;
};
export type UploadImageReturn = { error: string } | { fileUrl: string };

export const uploadFile = async ({
  contentType,
  buffer,
  fileName,
}: UploadFileType): Promise<UploadImageReturn> => {
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

type GetFileDetailsReturn = { error: string } | FilePreviewSchema[];
export const getFileDetails = async (
  filePath: string[],
): Promise<GetFileDetailsReturn> => {
  await initApp();
  const storage = getStorage().bucket();

  const filePreviewPromises = filePath.map(async (file) => {
    const fileRef = storage.file(file);
    try {
      const [metadata, fileUrl] = await Promise.all([
        fileRef.getMetadata(),
        getDownloadURL(fileRef),
      ]);
      const { name, size, contentType } = metadata[0];
      const fileName = name ? path.basename(name) : 'Unknown file';
      const filePreview: FilePreviewSchema = {
        fileUrl,
        fileSize: Number(size),
        fileType: contentType || 'unknown type',
        fileName,
        filePath: name || 'Unknown file',
      };
      return filePreview;
    } catch (e) {
      console.error('Error retrieving file metadata: ', e);
      return null;
    }
  });

  try {
    const filePreviewResults = await Promise.all(filePreviewPromises);
    const filteredFilePreviews = filePreviewResults.filter(
      (filePreview): filePreview is FilePreviewSchema => filePreview !== null,
    );
    if (filteredFilePreviews.length === 0) {
      return {
        error: 'Failed to retrieve file details. Please try again later.',
      };
    }
    return filteredFilePreviews;
  } catch (e) {
    console.error('Error retrieving file details: ', e);
    return {
      error:
        'An error occurred while retrieving file details. Please try again later.',
    };
  }
};

export const deleteFiles = async (
  filePaths: string[],
): Promise<{ error: string } | string[]> => {
  await initApp();
  const bucket = getStorage().bucket();
  try {
    const deletePromises = filePaths.map(async (path) => {
      const file = bucket.file(path);
      await file.delete();
      return path;
    });
    return await Promise.all(deletePromises);
  } catch (e) {
    console.error('Error deleting files from Firebase: ', e);
    return {
      error:
        'Failed to delete files due to a server error. Please try again later',
    };
  }
};
