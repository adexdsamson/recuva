import { useToken, useUser, useVerificationToken } from "@/store/authSlice";

export const useAuthentication = () => {
  const user = useUser();
  const token = useToken();

  if (!user?.id && !token) {
    return false;
  }

  return true;
};

export const useVerificationAuthentication = () => {
  const token = useVerificationToken();

  if (!token) {
    return false;
  }

  return true;
};
