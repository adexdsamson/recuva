import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from "react-router-dom";
import { routes } from "@/routes";
import { Suspense, useEffect, useState } from "react";
import { useProviders } from "./hooks/useProviders";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Loading from "@/components/ui/Spinner";
import { ErrorFallback } from "@/components/layouts/Error";
import { Providers } from "@/hooks/useProviders/type";
import * as Sentry from "@sentry/react";
import { nets } from "face-api.js";

function App() {
    const queryClient = new QueryClient();
    const [isInitialized, setIsInitialized] = useState(false);

    const router = createBrowserRouter(createRoutesFromElements(routes));

    const onInitializeModel = async () => {
        Promise.all([
            await nets.tinyFaceDetector.loadFromUri(`/models`),
            await nets.faceLandmark68Net.loadFromUri('/models'),
            await nets.faceRecognitionNet.loadFromUri("/models"),
            await nets.faceExpressionNet.loadFromUri('/models')
        ]).then(() => {
            setIsInitialized(true)
        }).catch((error) => {
            console.log("onInitializeModel", error)
            setIsInitialized(false)
        })
    }

    useEffect(() => {
        if (!isInitialized) {
            onInitializeModel();
        }
    }, [isInitialized]);

    const providers: Providers = {
        types: Sentry.ErrorBoundary,
        props: { fallback: ErrorFallback },
        children: [
            {
                types: Suspense,
                props: {
                    fallback: (
                        <div className="flex flex-auto items-center justify-center flex-col min-h-[100vh]">
                            <Loading />
                        </div>
                    ),
                },
                children: [
                    {
                        types: QueryClientProvider,
                        props: { client: queryClient },
                        children: [
                            {
                                types: RouterProvider,
                                props: { router },
                            },
                        ],
                    },
                ],
            },
            {
                types: Toaster,
                props: {},
            },
        ],
    };

    return useProviders(providers);
}

export default App;
