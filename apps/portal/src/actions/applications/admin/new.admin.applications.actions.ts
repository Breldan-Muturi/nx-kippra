'use server';

import { db } from '@/lib/db';

type NewAdminApplicationReturn =
  | { error: string }
  | { success: string; applicationId: string };
export const newAdminApplication =
  async (): Promise<NewAdminApplicationReturn> => {
    const application = await db.application.create({
      data,
    });
  };
