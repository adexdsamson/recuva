/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import Webcam from "react-webcam";
import Container from "@/components/layouts/Container";
import PoweredByAutogon from "@/assets/power-by-autogon.svg";
import { useRef, useState } from "react";
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
import { detectSingleFace, TinyFaceDetectorOptions, matchDimensions, FaceExpressions} from 'face-api.js';
import { useInterval } from "usehooks-ts";

export const FaceVerification = () => {
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
    const [faceDescriptor, setFaceDescriptor] = useState<Float32Array>();


    const { mutate, isPending } = useMutation<
        ApiResponse<FaceVerificationResponse>,
        ApiResponseError,
        FormData
    >({
        mutationFn: (payload) =>
            postRequest("dormant-accounts/document/upload/", payload, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }),
        onSuccess: (data) => {
            toastHandler.success("Face Verification", data.data.message);
            navigate("/verification/id-identity", { state: faceDescriptor });
        },
        onError: (error) => {
            toastHandler.error(
                "Face Verification",
                error ?? "Unknown error"
            );
        },
    });

    const style = {
        height: 320,
        width: 248,
    }

    const checkLiveliness = (expressions?: FaceExpressions) => {
        if (!expressions) return false;

        // Simplistic approach: check if the person is smiling or has another expression
        const { happy, neutral, surprised } = expressions;
        return happy > 0.5 || neutral > 0.5 || surprised > 0.5;
    };

    const onCapture = async () => {
        if (!webcamRef.current) return;

        const video = webcamRef.current?.video;

        if (!video) return;

        const detections = await detectSingleFace(video, new TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptor();

        if (detections && detections.detection.score < 0.9) return;

        const isLiveliness = checkLiveliness(detections?.expressions);

        if (!isLiveliness) return;

        setFaceDescriptor(detections?.descriptor);

        matchDimensions(video, style);

        const imageSrc = webcamRef.current?.getScreenshot();

        if (!imageSrc) return;

        setImgSrc(imageSrc);
    }

    useInterval(onCapture, 1000)

    const handleSubmit = async () => {
        if (imgSrc && token) {
            const formData = new FormData();
            formData.append("verification_type", "face_verification");
            formData.append("token", token);
            formData.append("file", imgSrc);
            mutate(formData);
        }
    };

    return (
        <div className="flex flex-col py-20 mt-4 w-full text-center">
            <h2 className="w-fit mx-auto text-center text-xl font-semibold text-orange-500">
                Face Verification
            </h2>
            <div
                className="shrink-0 mt-12 rounded-full mx-auto bg-zinc-300 w-[15.5rem] h-[20rem] relative overflow-hidden"
                aria-label="Face verification frame"
            >
                {!imgSrc && (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        forceScreenshotSourceSize
                        videoConstraints={{
                            facingMode: "Front",
                        }}
                        style={{ ...style, objectFit: "cover", }}
                    />
                )}
                {imgSrc && (
                    <img src={imgSrc} className="w-full h-full object-cover" />
                )}
            </div>

            {/* {!imgSrc && showSmileMessage === "hasSmile" ? (
                <p className="mt-5">Please smile</p>
            ) : showSmileMessage === "stopSmiling" ? (
                <p className="mt-5">Stop Smiling</p>
            ) : null} */}

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
