"use server";
import { getDownloadURL, getStorage } from "firebase-admin/storage";
import { initApp } from "./config";
import { ActionReturnType } from "@/types/action-return.types";

export const uploadPDFile = async (
  buffer: Buffer,
  fileName: string,
): Promise<ActionReturnType> => {
  await initApp();
  const bucket = getStorage().bucket();
  const file = bucket.file(fileName);
  try {
    await file.save(buffer, {
      metadata: { contentType: "application/pdf" },
    });
    const fileUrl = await getDownloadURL(file);
    return { success: fileUrl };
  } catch (error) {
    console.log("Firebase error: ", error);
    return { error: "Error uploading file" };
  }
};
