import Container from "@/components/layouts/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Outlet } from "react-router-dom";
import { Fragment } from "react";

export const AuthLayout = () => {
  return (
    <Container fullHeight as={Fragment}>
      <div className="absolute left-0 h-full right-0 top-0 bottom-0 w-full"></div>
      <div className="overflow-hidden bg-[#FAFAFA] flex flex-auto flex-col min-h-[100vh]">
        <div className="h-full relative p-4 py-12 sm:p-12">
          <Container
            display="flex"
            direction="col"
            className="flex-auto items-center justify-center min-w-0 h-full"
          >
            <Card className="min-w-[320px] bg-white md:min-w-[450px]">
              <CardContent className="md:p-10">
                <Outlet />
              </CardContent>
            </Card>
          </Container>
        </div>
      </div>
    </Container>
  );
};
