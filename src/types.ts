import { AxiosResponse, AxiosError } from "axios";

export type ApiError = {
  status: boolean;
  message: string;
};

type ApiSuccess<T = unknown> = {
  status: boolean;
  message: string;
  data: T;
};

export type ApiResponse<T = unknown> = AxiosResponse<ApiSuccess<T>>;
export type ApiResponseError = AxiosError<ApiError>;

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  priviledges: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  hasVerifiedEmail: boolean;
  role: string;
  date_registered: Date;
}

export interface CampaignResponseList {
  count: number;
  next: null | string;
  previous: null | string;
  results: ApiSuccess<Campaign[]>;
}

export interface Campaign {
  id: string;
  created_at: Date;
  name: string;
}

export interface CampaignDetailResponse {
  campaign: CampaignDetail;
  count: number;
  next: null | string;
  previous: null | string;
  dormant_accounts: DormantAccount[];
}

export interface CampaignDetail {
  id: string;
  created_at: Date;
  name: string;
  recipients: number;
  delivered: number;
  opened: number;
  face_verification: number;
  id_verification: number;
  utility_bill: number;
  completed: number;
}

export interface DormantType {
  dormant_accounts: DormantAccount[];
}

export interface DormantAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  face_verification: null;
  id_verification: null;
  delivered: boolean;
  utility_bill: null;
  created_at: Date;
  updated_at: Date;
}

export interface FaceVerificationResponse {
  message: string;
  url: string;
}

export interface AccountDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  face_verification: null;
  id_verification: null;
  delivered: boolean;
  utility_bill: null;
  created_at: Date;
  updated_at: Date;
}


export interface Apikeys {
  user: string;
  prefix: string;
  key_str: string;
  name: string;
  created: Date;
}
