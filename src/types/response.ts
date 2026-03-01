import { AxiosResponse, AxiosError } from "axios";

export interface ResponseData {
  success: boolean;
  resp_code: number;
  resp_msg?: string;
  error_msg?: string;
  message?: string;
  error?: string;
  data?: unknown;
  token?: string;
}

export interface Response extends AxiosResponse {
  data: ResponseData;
}

export interface AxiosErrorResponse extends AxiosError {
  response?: Response;
}