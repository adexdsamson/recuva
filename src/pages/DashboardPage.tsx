import Container from "@/components/layouts/Container";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import EmptyIcon from "@/assets/undraw_blank_canvas_re_2hwy 1.svg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldProps, FormPropsRef, useForge } from "@/lib/forge";
import { useToastHandlers } from "@/hooks/useToaster";
import { ApiResponse, ApiResponseError, CampaignResponseList } from "@/types";
import {
  TextInput,
  TextInputProps,
} from "@/components/layouts/FormInputs/TextInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRequest, postRequest } from "@/lib/axiosInstance";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { MdOutlineSignalCellularAlt } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AxiosResponse } from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createPageNumbers } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const DashboardPage = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const navigate = useNavigate();

  const { data, isPending } = useQuery<
    AxiosResponse<CampaignResponseList>,
    ApiResponseError
  >({
    queryKey: ["campaigns", pageIndex],
    queryFn: () => getRequest("campaigns/"),
  });

  if (isPending) {
    return (
      <Container noGutter className="pt-16 animate-pulse">
        <div className="h-24 w-full bg-slate-300 my-5" />
        <div className="h-24 w-full bg-slate-300 my-5" />
        <div className="h-24 w-full bg-slate-300 my-5" />
      </Container>
    );
  }

  const campaigns = data?.data.results.data;

  return (
    <Container noGutter className="pt-10">
      <div className="flex items-center justify-between">
        <h5 className="text-2xl font-bold text-[#232F3E]">Recent Campaigns</h5>
        <Campaign />
      </div>

      {!isPending && campaigns?.length === 0 && (
        <div className="grid place-items-center h-[80vh] w-full">
          <div>
            <img src={EmptyIcon} />
            <p className="text-sm text-center text-gray-500 mt-3">
              No new Campaign yet!
            </p>
          </div>
        </div>
      )}

      {campaigns?.length !== 0 && (
        <div className="mt-16">
          <Input placeholder="Search....." className="w-80" />

          {campaigns?.map((item) => (
            <CampaignItem
              name={item.name}
              key={item.id}
              onClick={() =>
                navigate("/dashboard/campaign-detail", { state: item })
              }
            />
          ))}

          <Pagination className="justify-end pt-10 md:pt-0 lg:pt-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  size="sm"
                  onClick={() => {
                    setPageIndex(pageIndex - 1);
                  }}
                />
              </PaginationItem>

              {createPageNumbers(
                Math.ceil((data?.data.count ?? 0) / 10),
                pageIndex
              ).map((page) =>
                typeof page === "string" ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem>
                    <PaginationLink
                      size="sm"
                      href="#"
                      isActive={page === pageIndex}
                      onClick={() => setPageIndex(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  size="sm"
                  onClick={() => {
                    setPageIndex(pageIndex + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Container>
  );
};

type FormState = {
  name: string;
};

const schema = yup.object({
  name: yup.string().required(),
});

type SlotProps = TextInputProps;

interface CampaignResponse {
  status: boolean;
  message: string;
  data: Data;
}

interface Data {
  name: string;
  id: string;
}

const Campaign = () => {
  const formRef = useRef<FormPropsRef | null>(null);
  const navigate = useNavigate();
  const toastHandler = useToastHandlers();
  const renderInput: FieldProps<SlotProps>[] = [
    {
      name: "name",
      label: "",
      placeholder: "Campaign Name",
      component: TextInput,
    },
  ];

  const { ForgeForm } = useForge<FormState>({
    defaultValues: {},
    resolver: yupResolver(schema),
    fieldProps: renderInput,
  });

  const { mutateAsync, isPending } = useMutation<
    ApiResponse<CampaignResponse>,
    ApiResponseError,
    FormState
  >({
    mutationFn: (payload) => postRequest("campaigns/", payload),
  });

  const handleSubmit = async (data: FormState) => {
    const TOAST_TITLE = "Campaign";
    try {
      const result = await mutateAsync(data);

      if (!result.data.status) {
        toastHandler.error(TOAST_TITLE, result.data.message);
        return;
      }

      navigate("/dashboard/contact-import", { state: result.data.data });
    } catch (error) {
      const err = error as ApiResponseError;
      toastHandler.error(TOAST_TITLE, err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <FaPlus className="mr-3" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
          <DialogDescription>Give a name to your campaign</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ForgeForm ref={formRef} onSubmit={handleSubmit} control="forger" />
        </div>
        <DialogFooter>
          <Button
            isLoading={isPending}
            onClick={() => formRef.current?.onSubmit()}
            type="submit"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type CampaignItem = {
  name: string;
  onClick: () => void;
};

const CampaignItem = (props: CampaignItem) => {
  return (
    <div className="bg-white h-24 px-5 my-5 w-full flex items-center justify-between rounded shadow">
      <h4 className="text-xl font-semibold">{props.name}</h4>
      <div className="flex items-center gap-4">
        <Button onClick={props.onClick}>
          {" "}
          <MdOutlineSignalCellularAlt className="mr-2 h-4 w-4" /> View Report
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="bg-primary/30 rounded-full grid place-items-center h-10 w-10">
              <ChevronDownIcon className="text-primary h-5 w-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
