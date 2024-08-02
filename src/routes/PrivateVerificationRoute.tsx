/* eslint-disable react-hooks/exhaustive-deps */
import { useVerificationAuthentication } from "@/hooks/useAuthentication";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRoute = {
  children: ReactNode;
};

export const PrivateVerificationRoute = (props: ProtectedRoute) => {
 const isAuthenticated = useVerificationAuthentication();

  return isAuthenticated ? <Navigate to="/verification" /> : props.children;
};
