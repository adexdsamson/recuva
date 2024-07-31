/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  // Apikeys,
  ApiResponse,
  ApiResponseError,
  CampaignResponseList,
} from "@/types";
import {
  TextInput,
  TextInputProps,
} from "@/components/layouts/FormInputs/TextInput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { forwardRef, ReactNode, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, } from "@tanstack/react-query";
import {
  // deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/lib/axiosInstance";
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
import { useDebounceValue } from "usehooks-ts";
import { Input } from "@/components/ui/input";
import { ConfirmAlert } from "@/components/layouts/ConfirmAlert";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Trash } from "lucide-react";
import {
  TextSelectProps,
} from "@/components/layouts/FormInputs/TextSelect";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(1);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [search, setSearch] = useDebounceValue<string | null>(null, 500);

  const { data, isPending } = useQuery<
    AxiosResponse<CampaignResponseList>,
    ApiResponseError
  >({
    queryKey: ["campaigns", pageIndex, search],
    queryFn: () =>
      getRequest(search ? `campaigns/?search=${search}` : "campaigns/"),
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Settings</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <CreateChannel />
            </DropdownMenuContent>
          </DropdownMenu>
          <Campaign />
        </div>
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
          <Input
            className="w-80"
            value={searchText ?? ""}
            placeholder="Search....."
            onChange={(event) => {
              setSearchText(event.target.value);
              setSearch(event.target.value);
            }}
          />

          {campaigns?.map((item) => (
            <CampaignItem
              id={item.id}
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

type SlotProps = TextInputProps | TextSelectProps;

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

const channelSchema = yup.object({
  sms_endpoint: yup.string().required(),
  email_endpoint: yup.string().required(),
  api_key: yup.string().required(),
});

type ChannelForm = {
  sms_endpoint: string;
  email_endpoint: string;
  api_key: string;
};

const CreateChannel = () => {
  const formRef = useRef<FormPropsRef | null>(null);
  const toastHandler = useToastHandlers();


  const renderInput: FieldProps<SlotProps>[] = [
    {
      name: "sms_endpoint",
      label: "SMS",
      placeholder: "Enter SMS provider URL",
      component: TextInput,
    },
    {
      name: "email_endpoint",
      label: "Email",
      placeholder: "Enter Email provider URL",
      component: TextInput,
    },
    {
      name: "api_key",
      label: "Api Key",
      placeholder: "Enter you API verification key",
      component: TextInput,
    },
  ];

  const { ForgeForm, setValue } = useForge<ChannelForm>({
    defaultValues: {},
    resolver: yupResolver(channelSchema),
    fieldProps: renderInput,
  });

  const { isSuccess, data } = useQuery<
    ApiResponse<ChannelForm>,
    ApiResponseError
  >({
    queryKey: ["channel"],
    queryFn: () => getRequest("organization/channels/"),
  });

  const { mutateAsync, isPending } = useMutation<
    ApiResponse<CampaignResponse>,
    ApiResponseError,
    ChannelForm
  >({
    mutationFn: (payload) => putRequest("organization/channels/", payload),
  });

  const handleSubmit = async (data:ChannelForm) => {
    const TOAST_TITLE = "Campaign Channel";
    try {
      const result = await mutateAsync(data);

      if (!result.data.status) {
        toastHandler.error(TOAST_TITLE, result.data.message);
        return;
      }

      toastHandler.success(TOAST_TITLE, "Saved");
    } catch (error) {
      const err = error as ApiResponseError;
      toastHandler.error(TOAST_TITLE, err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setValue("email_endpoint", data.data.data.email_endpoint);
      setValue("sms_endpoint", data.data.data.sms_endpoint);
      setValue("api_key", data.data.data.api_key);
    }
  }, [isSuccess]);

  return (
    <DialogItem triggerChildren="Add Channel">
      <DialogHeader>
        <DialogTitle>Campaign Channel</DialogTitle>
        <DialogDescription>
          Provide url endpoint for the channels available
        </DialogDescription>
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
    </DialogItem>
  );
};

// type API_KEY_Payload = {
//   key_name: string;
// };

// const apikeySchema = yup.object({
//   key_name: yup.string().required(),
// });

// const ApiKey = () => {
//   const toastHandler = useToastHandlers();
//   const queryClient = useQueryClient();

//   const { ForgeForm } = useForge({
//     defaultValues: {},
//     resolver: yupResolver(apikeySchema),
//   });

//   const { data } = useQuery<ApiResponse<Apikeys[]>, ApiResponseError>({
//     queryKey: ["api-key"],
//     queryFn: () => getRequest("auth/apikey/"),
//   });

//   const { mutate, isPending } = useMutation<
//     ApiResponse<Apikeys>,
//     ApiResponseError,
//     API_KEY_Payload
//   >({
//     mutationFn: (payload) => postRequest("auth/apikey/", payload),
//     onError: (error) => {
//       toastHandler.error("API keys", error.message);
//     },
//     onSuccess: (res) => {
//       toastHandler.success("API keys", res.data.message);
//       queryClient.invalidateQueries({ queryKey: ["api-key"] });
//     },
//   });

//   const deleteMutations = useMutation<
//     ApiResponse,
//     ApiResponseError,
//     { prefix: string }
//   >({
//     mutationFn: (payload) => deleteRequest("auth/apikey/", payload),
//     onError: (error) => {
//       toastHandler.error("API keys", error.message);
//     },
//     onSuccess: (res) => {
//       toastHandler.success("API keys", res.data.message);
//       queryClient.invalidateQueries({ queryKey: ["api-key"] });
//     },
//   });

//   return (
//     <SheetItem triggerChildren="Api Keys">
//       <SheetHeader>
//         <SheetTitle>API Keys</SheetTitle>
//         <SheetDescription>
//           Make changes to your profile here. Click save when you're done.
//         </SheetDescription>
//       </SheetHeader>
//       <ForgeForm onSubmit={mutate} className="flex items-center gap-2 mt-8">
//         <Input name="key_name" placeholder="Enter api-key name" />
//         <Button type="submit" isLoading={isPending}>
//           Create
//         </Button>
//       </ForgeForm>
//       <div className="mt-10">
//         <h4 className="border-b-2 mb-5 pb-2 ">API Keys</h4>
//         {data?.data.data.map((item) => (
//           <ApiKeyItem
//             key={item.name}
//             name={item.name}
//             onDelete={() => deleteMutations.mutate({ prefix: item.prefix })}
//           />
//         ))}
//       </div>
//     </SheetItem>
//   );
// };

// const ApiKeyItem = ({
//   name,
//   onDelete,
// }: {
//   name: string;
//   onDelete: () => void;
// }) => {
//   return (
//     <div className="flex items-center justify-between px-3 py-2 border rounded-md">
//       <h4 className="text-sm text-gray-600">{name}</h4>
//       <Trash
//         onClick={onDelete}
//         className="h-4 w-4 text-red-600 cursor-pointer"
//       />
//     </div>
//   );
// };

type CampaignItem = {
  id: string;
  name: string;
  onClick: () => void;
};

const CampaignItem = (props: CampaignItem) => {
  return (
    <div className="bg-white h-24 px-5 my-5 w-full flex items-center justify-between rounded shadow">
      <h4 className="text-xl font-semibold">{props.name}</h4>
      <div className="flex items-center gap-4">
        <Button onClick={props.onClick}>
          <MdOutlineSignalCellularAlt className="mr-2 h-4 w-4" /> View Report
        </Button>

        <ConfirmAlert
          text="Are you sure you want to delete this campaign? Deleted campaign can’t be recovered again after deleting"
          title="Delete Campaign"
          url={`campaigns/${props.id}/`}
          queryKey={["campaigns"]}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="bg-primary/30 rounded-full grid place-items-center h-10 w-10">
                <ChevronDownIcon className="text-primary h-5 w-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DialogTrigger asChild>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </ConfirmAlert>
      </div>
    </div>
  );
};

type DialogItemProps = {
  triggerChildren?: ReactNode;
  children?: ReactNode;
  onSelect?: () => void;
  onOpenChange?: (open: boolean) => void;
};

const DialogItem = forwardRef<HTMLDivElement, DialogItemProps>((props, ref) => {
  const { triggerChildren, children, onSelect, onOpenChange, ...itemProps } =
    props;
  return (
    <Dialog
      onOpenChange={(open) => {
        onOpenChange?.(open);
      }}
    >
      <DialogTrigger asChild>
        <DropdownMenuItem
          {...itemProps}
          ref={ref}
          className="DropdownMenuItem"
          onSelect={(event) => {
            event.preventDefault();
            onSelect && onSelect();
          }}
        >
          {triggerChildren}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="">{children}</DialogContent>
    </Dialog>
  );
});

// const SheetItem = forwardRef<HTMLDivElement, DialogItemProps>((props, ref) => {
//   const { triggerChildren, children, onSelect, onOpenChange, ...itemProps } =
//     props;
//   return (
//     <Sheet
//       onOpenChange={(open) => {
//         onOpenChange?.(open);
//       }}
//     >
//       <SheetTrigger asChild>
//         <DropdownMenuItem
//           {...itemProps}
//           ref={ref}
//           className="DropdownMenuItem"
//           onSelect={(event) => {
//             event.preventDefault();
//             onSelect && onSelect();
//           }}
//         >
//           {triggerChildren}
//         </DropdownMenuItem>
//       </SheetTrigger>
//       <SheetContent className="">{children}</SheetContent>
//     </Sheet>
//   );
// });
