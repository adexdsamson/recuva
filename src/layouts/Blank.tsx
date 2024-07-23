import Container from "@/components/layouts/Container";
import { Outlet } from "react-router-dom";

export const BlankLayout = () => {
  return (
    <Container fullHeight as="div">
      <div className="absolute left-0 h-full right-0 top-0 bottom-0 w-full"></div>
      <div className="overflow-hidden bg-[#FAFAFA] flex flex-auto flex-col min-h-[100vh]">
        <div className="h-full relative sm:p-12">
          <Outlet />
        </div>
      </div>
    </Container>
  );
};
