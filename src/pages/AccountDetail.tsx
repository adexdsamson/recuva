import Container from "@/components/layouts/Container";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from "@/components/ui/Spinner";
import { getRequest } from "@/lib/axiosInstance";
import { ApiResponse, ApiResponseError, DormantAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaRegFileLines } from "react-icons/fa6";
import { downloadFile } from "@/lib/utils";

export const AccountDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as DormantAccount;

  const { data, isPending } = useQuery<
    ApiResponse<DormantAccount>,
    ApiResponseError
  >({
    queryKey: ["dormant-account", state.id],
    queryFn: () => getRequest(`dormant-accounts/${state.id}/`),
  });

  if (isPending) {
    return <Spinner size={62} className="text-primary my-10" />;
  }

  const account = data?.data.data;

  return (
    <Container noGutter className="pt-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 mb-8">
          <ChevronLeft
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h5 className="text-2xl font-bold text-[#232F3E] capitalize">
            User’s Report
          </h5>
        </div>
      </div>

      <div className="w-full bg-white rounded-lg p-6 flex flex-col gap-4 shadow">
        <div className="flex justify-between">
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg">Transaction Details</h4>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="flex flex-col gap-1">
            <h6 className="text-base !text-slate-400">Account Name</h6>
            <p className="text-sm">
              {account?.first_name} {account?.first_name}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-base !text-slate-400">Email Address</h4>
            <p className="text-sm">{account?.email}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-base !text-slate-400">Phone Number</h4>
            <p className="text-sm">{account?.phone}</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-lg p-6 mt-5 flex flex-col gap-4 shadow">
        <div className="flex justify-between">
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg">Document Details</h4>
          </div>
        </div>

        {account?.face_verification && <DocumentUpload filename="Face Document" url={account.face_verification} />}
        {account?.id_verification && <DocumentUpload filename="ID Document" url={account.id_verification} />}
        {account?.utility_bill && <DocumentUpload filename="Utility Bill Document" url={account.utility_bill} />}
      </div>

      <div className="w-full bg-white rounded-lg p-6 mt-5 flex flex-col gap-4 shadow">
        <div className="flex justify-between">
          <div className="border-b border-gray-300 pb-4">
            <h4 className="text-lg">Report Details</h4>
          </div>
        </div>
        <div></div>
      </div>
    </Container>
  );
};

interface DocumentProps {
  filename: string;
  url: string;
}
const DocumentUpload = ({ filename, url }: DocumentProps) => {
  const openPdf = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex justify-between pb-3 items-center mt-2">
      <div className="flex  gap-2 items-center">
        <FaRegFileLines size={30} className="text-slate-400 " />
        <div>
          <p>{filename}</p>
        </div>
      </div>
      <div className="flex gap-2  ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="-m-1">
              <BsThreeDotsVertical size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            <DropdownMenuLabel>Action</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openPdf(url)}>
                <span>Open</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadFile(url, filename)}>
                <span>Download</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
