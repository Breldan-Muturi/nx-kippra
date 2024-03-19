import { useSession } from "next-auth/react";

export const useCurrentisOAuth = () => {
  const session = useSession();
  return session?.data?.user.isOAuth;
};
