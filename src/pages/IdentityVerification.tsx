/* eslint-disable react-hooks/exhaustive-deps */
import Container from "@/components/layouts/Container";
import { Button } from "@/components/ui/button";
import PoweredByAutogon from "@/assets/power-by-autogon.svg";
import { User2Icon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSetVerificationToken } from "@/store/authSlice";
import { useEffect } from "react";
import { useToastHandlers } from "@/hooks/useToaster";

export const IdentityVerification = () => {
  const navigate = useNavigate();
  const toastHandlers = useToastHandlers();
  const setToken = useSetVerificationToken();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("verificationToken");

  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  const handleNavigate = () =>
    !token
      ? toastHandlers.error("Missing Information", "Reopen link to continue")
      : navigate("/verification/face-identity");

  return (
    <Container className="flex flex-col h-[100dvh] md:w-[40rem] md:mx-auto ">
      <div className="flex-1">
        <div className="h-full w-full flex flex-col justify-center items-center">
          <div className="p-4 bg-primary/10 w-fit rounded-md">
            <User2Icon className="h-14 w-14 text-[#F57D00]" />
          </div>
          <h6 className="mt-5 text-3xl font-medium text-[#F57D00]">
            Verify your identity
          </h6>
          <p className="mt-6 text-center text-base w-[22rem] mx-auto">
            Let's re-activate your bank account by verifying your identity
            within few steps.
          </p>
        </div>
      </div>

      <div className="w-full h-fit mb-5 px-5">
        <Button className="w-full" onClick={handleNavigate}>
          Let's Verify
        </Button>
        <div className="w-20 h-20 mx-auto">
          <img
            src={PoweredByAutogon}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </Container>
  );
};
