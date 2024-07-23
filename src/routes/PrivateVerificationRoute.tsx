/* eslint-disable react-hooks/exhaustive-deps */
import { useSetToken } from "@/store/authSlice";
import { ReactNode, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

type ProtectedRoute = {
  children: ReactNode;
};

export const PrivateVerificationRoute = (props: ProtectedRoute) => {
  const setToken = useSetToken();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      setToken(token)
    }
  }, [token])

  return token ? (
    <Navigate to="/verification" />
  ) : (
    props.children
  );
};
