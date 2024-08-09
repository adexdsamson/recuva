import Container from "@/components/layouts/Container";
import { DataTable } from "@/components/layouts/DataTable";
import { Button } from "@/components/ui/button";
import { getRequest } from "@/lib/axiosInstance";
import {
    ApiResponse,
    ApiResponseError,
    Campaign,
    CampaignDetailResponse,
    DormantAccount,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightDoubleLine } from "react-icons/ri";
import { ChevronDownIcon, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const Detail = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as Campaign;

    const { data, isPending } = useQuery<
        ApiResponse<CampaignDetailResponse>,
        ApiResponseError
    >({
        queryKey: ["campaign-detail"],
        queryFn: () => getRequest(`campaigns/${state.id}/`),
    });

    const dash = data?.data?.data.campaign;
    const dormantAccounts = data?.data.data.dormant_accounts;

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
            cell: ({ row }) => (row.getValue("face_verification") ? "true" : "false"),
        },
        {
            accessorKey: "id_verification",
            header: "ID Verification",
            cell: ({ row }) => (row.getValue("id_verification") ? "true" : "false"),
        },
        {
            accessorKey: "utility_bills",
            header: "Utility Bills",
            cell: ({ row }) => (row.getValue("utility_bills") ? "true" : "false"),
        },
        {
            id: "actions",
            header: () => <div className="text-center font-medium">Action</div>,
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            navigate("/dashboard/campaign-account-detail", {
                                state: row.original,
                            });
                        }}
                    >
                        View
                        <RiArrowRightDoubleLine className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
    ];

    return (
        <Container noGutter className="pt-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <ChevronLeft
                        className="cursor-pointer"
                        onClick={() => navigate(-1)}
                    />
                    <h5 className="text-2xl font-bold text-[#232F3E] capitalize">
                        {state.name ?? dash?.name}’s Report
                    </h5>
                </div>
                <Button>Download Report</Button>
            </div>

            <div className="flex items-center flex-wrap gap-x-6 gap-y-3 h-fit w-full mt-10 mb-20">
                <DashStats
                    name="Recipients"
                    value={dash?.recipients.toString() ?? ""}
                />
                <DashStats name="Delivered" value={dash?.delivered.toString() ?? ""} />
                <DashStats name="Opened" value={dash?.opened.toString() ?? ""} />
                <DashStats
                    name="Complete Verification"
                    value={dash?.completed.toString() ?? ""}
                />
                <DashStats
                    name="Face Verification"
                    value={dash?.face_verification?.toString() ?? ""}
                />
                <DashStats
                    name="ID Verification"
                    value={dash?.id_verification?.toString() ?? ""}
                />
                <DashStats
                    name="Utility Bills Verification"
                    value={dash?.utility_bill?.toString() ?? ""}
                />
                <DashStats name="Channels" value="0" />
            </div>

            <DataTable
                columns={columns}
                data={dormantAccounts ?? []}
                options={{
                    totalCounts: data?.data?.data.count ?? 0,
                    isLoading: isPending,
                }}
            />
        </Container>
    );
};

type DashStats = {
    value: string;
    name: string;
};

const DashStats = (props: DashStats) => {
    return (
        <div className="flex h-20 px-3 w-64 bg-white shadow rounded justify-between items-center">
            <div className="">
                <h4 className="font-semibold text-base">{props.value}</h4>
                <p className="text-sm text-slate-400">{props.name}</p>
            </div>
            <div className="bg-primary/30 rounded-full grid place-items-center h-10 w-10">
                <ChevronDownIcon className="text-primary h-5 w-5" />
            </div>
        </div>
    );
};
