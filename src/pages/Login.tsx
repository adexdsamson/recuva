import { TextInput, TextInputProps } from "@/components/layouts/FormInputs/TextInput";
import { FieldProps, useForge, FormPropsRef } from "@/lib/forge";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState } from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useToastHandlers } from "@/hooks/useToaster";
import { useMutation } from "@tanstack/react-query";
import { ApiResponse, ApiResponseError, LoginResponse, } from "@/types";
import { postRequest } from "@/lib/axiosInstance";
import { useSetToken, useSetUser } from "@/store/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextSelectProps } from "@/components/layouts/FormInputs/TextSelect";

type SlotProps = TextInputProps | TextSelectProps;

type FormState = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const Login = () => {
  const setUser = useSetUser();
  const setToken = useSetToken();
  const navigate = useNavigate();
  const toastHandler = useToastHandlers();
  const formRef = useRef<FormPropsRef | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const renderInputs: FieldProps<SlotProps>[] = [
    {
      component: TextInput,
      name: "email",
      type: "email",
      autoComplete: "off",
      label: "Email Address",
      placeholder: "Email Address",
      containerClass: "mb-5",
    },
    {
      component: TextInput,
      name: "password",
      type: showPassword ? "text" : "password",
      autoComplete: "off",
      placeholder: "Password",
      label: "Password",
      endAdornment: showPassword ? (
        <EyeOpenIcon onClick={() => setShowPassword(false)} />
      ) : (
        <EyeClosedIcon onClick={() => setShowPassword(true)} />
      ),
    },
  ];

  const { mutateAsync, isPending } = useMutation<
    ApiResponse<LoginResponse>,
    ApiResponseError,
    FormState
  >({
    mutationFn: (payload) => postRequest("auth/login/", payload),
  });

  const { ForgeForm } = useForge<FormState>({
    resolver: yupResolver(schema),
    fieldProps: renderInputs,
  });

  const handleSubmit = async (data: FormState) => {
    const Toast_Title = "Authentication";
    try {
      const result = await mutateAsync(data);

      if (!result.data.status) {
        toastHandler.error(
          Toast_Title,
          result?.data?.message ?? "No access code available"
        );
        return;
      }

      const payload = result?.data?.data;

      setToken(payload.access_token);
      setUser(payload.user);

      navigate("/dashboard/home");
    } catch (error) {
      const err = error as ApiResponseError;

      toastHandler.error(Toast_Title, err);
    }
  };

  return (
    <>
      <div className="">
        <h3 className="text-4xl font-semibold text-center">Login</h3>
        <p className="text-center text-sm mt-2">Login to your account</p>
      </div>
      <ForgeForm ref={formRef} onSubmit={handleSubmit} className="mt-10" />

      <Button
        isLoading={isPending}
        onClick={() => formRef.current?.onSubmit()}
        className="w-full mt-6"
      >
        Login
      </Button>
    </>
  );
};
