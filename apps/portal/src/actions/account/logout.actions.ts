"use server";

import {signOut} from "@/auth";

export const logout = async () => {
  // Do some logging or audit trails at this point
  await signOut();
};
