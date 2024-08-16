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
import { useLocation, useNavigate } from "react-router-dom";
import { detectSingleFace, TinyFaceDetectorOptions, LabeledFaceDescriptors, FaceMatcher } from 'face-api.js';
import { useInterval, useMediaQuery } from "usehooks-ts";

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
    const navigate = useNavigate();
    const location = useLocation();
    const token = useVerificationToken();
    const toastHandler = useToastHandlers();
    const webcamRef = useRef<Webcam | null>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)')


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
                error ?? "Unknown error"
            );
        },
    });

    const onCapture = async () => {
        if (!webcamRef.current) return;

        const video = webcamRef.current.video as HTMLVideoElement;

        const detections = await detectSingleFace(video, new TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections && detections.detection.score < 0.5) return;
        if (!detections?.descriptor) return;

        const descriptor1 = location.state as Float32Array;
        const descriptor2 = detections?.descriptor;

        const labeledFaceDescriptors = [
            new LabeledFaceDescriptors('person1', [descriptor1]),
        ];

        const faceMatcher = new FaceMatcher(labeledFaceDescriptors, 0.5);

        const results = faceMatcher.findBestMatch(descriptor2);

        if(results.distance < 0.5) return;

        const imageSrc = webcamRef.current?.getScreenshot();

        if (!imageSrc) return;
        setImgSrc(imageSrc);
    }

    useInterval(onCapture, 1000);

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
                className="shrink-0 mt-12 rounded-md mx-auto bg-zinc-300 w-full h-60 relative overflow-hidden"
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
                            facingMode: isMobile ? { exact: "environment" } : "user",
                        }}
                        style={{
                            height: 240,
                            objectFit: "cover",
                            width: "100%",
                        }}
                    />
                )}
            </div>

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
        </div>
    );
};
