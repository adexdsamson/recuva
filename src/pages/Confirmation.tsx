import Container from "@/components/layouts/Container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { postRequest } from "@/lib/axiosInstance";
import { ApiResponse, ApiResponseError } from "@/types";
import { useToastHandlers } from "@/hooks/useToaster";

type Payload = {
  message: string;
  subject: string;
  channel: string;
  redirect_url: string;
};

export const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastHandler = useToastHandlers();

  const state = location.state as {
    name: string;
    id: string;
    count: number;
    subject: string;
    message: string;
    channel: string;
  };

  const { mutate, isPending } = useMutation<
    ApiResponse,
    ApiResponseError,
    Payload
  >({
    mutationFn: (payload) =>
      postRequest(`campaigns/${state.id}/confirm/`, payload),
    onSuccess: (data) => {
      toastHandler.success("Confirmation", data.data.message);
      navigate("/dashboard/home");
    },
    onError(error) {
      toastHandler.error("Confirmation", error.response?.data.message);
    },
  });

  const getHtml = (data: string) => {
    return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
          </head>
          <body>
            <div dangerouslySetInnerHTML={{ __html: ${data} }} />
          </body>
        </html>`;
  };

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div className="mt-3">
          <h5 className="text-2xl font-bold text-[#232F3E] mb-2">Campaigns</h5>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Import</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/message-import">
                  Message
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Confirmation</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {true && (
          <Button
            isLoading={isPending}
            onClick={() => {
              mutate({
                channel: state.channel,
                message: getHtml(state.message),
                subject: state.subject,
                redirect_url: "/verification",
              });
            }}
          >
            Send Now
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      <Card className="my-10">
        <CardHeader>
          <h6 className="text-xl">Overview</h6>
          <p className="text-sm text-gray-400">Confirm Campaign Overview</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300">Subject</p>
          <h5 className="text-base font-semibold">{state.subject}</h5>

          <div className="mt-4">
            <p className="text-sm text-gray-300">Message</p>
            <div dangerouslySetInnerHTML={{ __html: state.message }} />
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-300">Channels</p>
            <h5 className="text-base font-semibold">{state.channel}</h5>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-300">Total Recipients</p>
            <h5 className="text-base font-semibold">{state.count}</h5>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};
