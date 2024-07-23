import Container from "@/components/layouts/Container";
import { TextEditor } from "@/components/layouts/FormInputs/TextEditor";
import { TextInput } from "@/components/layouts/FormInputs/TextInput";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Forger, FormPropsRef, useForge } from "@/lib/forge";
import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";


type formState = {
  subject: string;
  message: string;
};

const schema = yup.object({
  subject: yup.string().required(),
  message: yup.string().required(),
});

export const Message = () => {
  const navigate = useNavigate();
  const ref = useRef<FormPropsRef | null>(null);
  const [channelType, setChannelType] = useState<"Email" | "SMS">("SMS");
  const { ForgeForm } = useForge<formState>({
    resolver: yupResolver(schema),
  });
  const location = useLocation();

  const state = location.state as { name: string; id: string; count: number };

  const handleSubmit = async (data: formState) => {
    navigate("/dashboard/confirm-campaign", {
      state: {
        ...data,
        ...state,
        channel: channelType,
      },
    });
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
                <BreadcrumbLink href="/docs/components">Message</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {true && (
          <Button onClick={() => ref.current?.onSubmit()}>
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      <Card className="my-10">
        <CardHeader>
          <h6 className="text-xl">Message</h6>
          <p className="text-sm text-gray-400">Compose a message</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              onClick={() => setChannelType("Email")}
              className={`rounded-full cursor-pointer border w-16 grid place-items-center text-sm h-7 ${
                channelType === "Email"
                  ? "border-primary bg-primary text-white"
                  : "border-black"
              }`}
            >
              Email
            </div>
            <div
              onClick={() => setChannelType("SMS")}
              className={`rounded-full cursor-pointer border w-16 grid place-items-center text-sm h-7 ${
                channelType === "SMS"
                  ? "border-primary bg-primary text-white"
                  : "border-black"
              }`}
            >
              SMS
            </div>
          </div>
          <div className="w-[50rem]">
            <ForgeForm ref={ref} onSubmit={handleSubmit}>
              <Forger
                name="subject"
                component={TextInput}
                placeholder="Subject"
              />
              <Forger name="message" component={TextEditor} />
            </ForgeForm>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};
