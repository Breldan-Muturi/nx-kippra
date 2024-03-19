import { currentUserId } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized user");
  return { userId: userId };
};

// FileRouter for your app , can contain multiple FileRoutes
export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  fileUpload: f({ pdf: { maxFileSize: "16MB", maxFileCount: 4 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  serverUpload: f({ pdf: { maxFileCount: 4, maxFileSize: "16MB" } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
export type OurFileRouterKeys = keyof OurFileRouter;
