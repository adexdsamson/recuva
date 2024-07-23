/* eslint-disable react-hooks/exhaustive-deps */
import Container from "@/components/layouts/Container";
import { DataTable } from "@/components/layouts/DataTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToastHandlers } from "@/hooks/useToaster";
import { postRequest } from "@/lib/axiosInstance";
import {
  ApiResponse,
  ApiResponseError,
  DormantAccount,
  DormantType,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import axios, { AxiosResponse } from "axios";
import { ChevronRight, CloudUploadIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useLocation, useNavigate } from "react-router-dom";

type FileResponse = {
  status: string;
  location: string;
  size: string;
  type: string;
};

type CSVPayload = {
  csv_data_url: string;
};

export const ContactImport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toastHandler = useToastHandlers();

  const state = location.state as Record<"name" | "id", string>;

  const { mutateAsync, isPending, data, isSuccess } = useMutation<
    ApiResponse<DormantType>,
    ApiResponseError,
    CSVPayload
  >({
    mutationFn: (payload) =>
      postRequest(`campaigns/${state.id}/dormant-accounts/`, payload),
  });

  const uploadQuery = useMutation<AxiosResponse<FileResponse>, Error, FormData>(
    {
      mutationFn: (payload) =>
        axios.post("https://api.autogon.ai/api/v1/engine/upload/", payload),
    }
  );

  const onUpload = async (file: File) => {
    const TOAST_TITLE = "File Upload";
    try {
      const formdata = new FormData();

      formdata.append("file", file);

      const result = await uploadQuery.mutateAsync(formdata);

      if (!result.status) {
        toastHandler.success(TOAST_TITLE, "Failed to Upload File");
        return;
      }

      toastHandler.success(TOAST_TITLE, "File upload successfully");
      return { title: file.name, url: result.data.location };
    } catch (error) {
      const err = error as ApiResponseError;
      toastHandler.error(TOAST_TITLE, err);
    }
  };

  const handleFileSubmit = async (file: File) => {
    const TOAST_TITLE = "File Submission";
    try {
      const res = await onUpload(file);

      if (!res?.url) {
        return;
      }

      const payload = {
        csv_data_url: res.url,
      };

      const result = await mutateAsync(payload);

      if (!result.data.status) {
        toastHandler.error(
          TOAST_TITLE,
          result?.data?.message ?? "Unknown error"
        );
        return;
      }

      toastHandler.success(TOAST_TITLE, result.data.message);
    } catch (error) {
      const err = error as ApiResponseError;
      toastHandler.error(TOAST_TITLE, err);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    handleFileSubmit(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({ onDrop });

  const columns: ColumnDef<DormantAccount>[] = [
    {
      accessorKey: "first_name",
      header: "First Name",
      cell: ({ row }) => row.getValue("first_name"),
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
      cell: ({ row }) => row.getValue("last_name"),
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: ({ row }) => row.getValue("email"),
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
      cell: ({ row }) => row.getValue("phone"),
    },
    {
      accessorKey: "face_verification",
      header: "Face Verification",
      cell: ({ row }) => row.getValue("face_verification"),
    },
    {
      accessorKey: "id_verification",
      header: "ID Verification",
      cell: ({ row }) => row.getValue("id_verification"),
    },
    {
      accessorKey: "utility_bills",
      header: "Utility Bills",
      cell: ({ row }) => row.getValue("utility_bills"),
    },
  ];

  return (
    <Container>
      <div className="flex items-center justify-between">
        <div className="mt-3">
          <h5 className="text-2xl font-bold text-[#232F3E] mb-2">Campaigns</h5>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>{state?.name}</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Import</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {isSuccess && (
          <Button
            onClick={() => navigate("/dashboard/message-import", { state: { ...state, count: data.data.data?.dormant_accounts?.length } })}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      <Card className="my-10">
        <CardHeader>
          <h6 className="text-xl">
            {isSuccess ? "Import Data" : "Import file"}
          </h6>
          <p className="text-sm text-gray-400">
            {isSuccess
              ? "Imported Data list"
              : "Choose file from your computer"}
          </p>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <DataTable
              columns={columns}
              data={data?.data?.data?.dormant_accounts ?? []}
              options={{ totalCounts: data.data.data.dormant_accounts.length }}
            />
          ) : (
            <div
              {...getRootProps()}
              className="border-2 border-dashed mt-5 h-96 rounded-2xl grid place-items-center"
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <h6 className="font-semibold">
                  Drag and drop file or choose from your computer
                </h6>
                <div className="mt-4 rounded-full bg-[#FFFAFA] mx-auto grid place-items-center w-16 h-16">
                  <CloudUploadIcon className="text-primary h-8 w-8" />
                </div>

                <Button isLoading={isPending} className="mt-5" onClick={open}>
                  Import File
                </Button>
                <span className="text-center block mt-5 w-80 mx-auto text-sm">
                  Supported file types: .csv, .txt, MS Excel (.xlsx) Maximum
                  allowed file size is 64MB
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};
