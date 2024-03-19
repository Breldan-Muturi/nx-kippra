import {
  initializeApp,
  cert,
  getApp,
  getApps,
  App,
  ServiceAccount,
} from "firebase-admin/app";
// import { env } from "@/validation/env.validation";

export const initApp = async () => {
  let firebaseApp: App;
  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    // construct service account object using environment variables
    const serviceAccount: ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(
        /\\n/g,
        "\n",
      ),
    };
    firebaseApp = initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
  return firebaseApp;
};
