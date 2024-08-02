/* eslint-disable react-hooks/exhaustive-deps */
import Webcam from "react-webcam";
import Container from "@/components/layouts/Container";
import PoweredByAutogon from "@/assets/power-by-autogon.svg";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { postRequest } from "@/lib/axiosInstance";
import {
  ApiResponse,
  ApiResponseError,
  FaceVerificationResponse,
} from "@/types";
import { useVerificationToken } from "@/store/authSlice";
import { useToastHandlers } from "@/hooks/useToaster";
import { useNavigate } from "react-router-dom";

export const IDVerification = () => {
  return (
    <Container className="flex flex-col h-[100dvh] md:w-[40rem] md:mx-auto ">
      <VerificationContainer />
      <div className="w-20 h-20 mx-auto">
        <img src={PoweredByAutogon} className="h-full w-full object-contain" />
      </div>
    </Container>
  );
};

const VerificationContainer = () => {
  const token = useVerificationToken();
  const navigate = useNavigate();
  const toastHandler = useToastHandlers();
  const webcamRef = useRef<Webcam | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // create a capture function
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const { mutate, isPending } = useMutation<
    ApiResponse<FaceVerificationResponse>,
    ApiResponseError,
    FormData
  >({
    mutationFn: (payload) =>
      postRequest("dormant-accounts/document/upload/", payload),
    onSuccess: (data) => {
      toastHandler.success("ID Verification", data.data.message);
      navigate("/verification/utility-bills");
    },
    onError: (error) => {
      toastHandler.error(
        "ID Verification",
        error.response?.data.message ?? "Unknown error"
      );
    },
  });

  const handleSubmit = () => {
    if (imgSrc && token) {
      const formData = new FormData();
      formData.append("verification_type", "id_verification");
      formData.append("token", token);
      formData.append("file", imgSrc);
      mutate(formData);
    }
  };

  return (
    <div className="flex flex-col py-20 mt-4 w-full text-center">
      <h2 className="w-fit mx-auto text-center text-xl font-semibold text-orange-500">
        ID Verification
      </h2>
      <div
        className="shrink-0 mt-12 rounded-md mx-auto bg-zinc-300 w-full h-[20rem] relative overflow-hidden"
        aria-label="Face verification frame"
      >
        {imgSrc ? (
          <img src={imgSrc} className="w-full h-full object-cover" />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            forceScreenshotSourceSize
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "Front",
            }}
            style={{
              height: 320,
              objectFit: "cover",
              width: "100%",
            }}
          />
        )}
      </div>

      {!imgSrc && (
        <Button onClick={capture} className="w-fit mx-auto mt-5">
          Take Photo
        </Button>
      )}

      {imgSrc && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => setImgSrc(null)}
            className="w-fit mt-5"
          >
            Retake
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isPending}
            className="w-fit mt-5"
          >
            Continue
          </Button>
        </div>
      )}
      {/* <p className="mt-7 mb-16 text-xs text-zinc-800">
        Put your face around the circle frame <br /> and blink your eyes.
      </p> */}
    </div>
  );
};
