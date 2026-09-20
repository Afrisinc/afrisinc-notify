import axios, { AxiosInstance } from "axios";
import { mailLogoutHandler } from "@/lib/mailAuthUtils";
import { getRuntimeConfig } from "@/lib/config";

/**
 * Separate axios client for the recipient mail portal - reads/writes only
 * `mail_token`, never `notify_token`. This is a sibling to apiClient.ts
 * rather than a parameterized version of it, since that singleton is
 * hardcoded to the business-dashboard identity and the business dashboard
 * must never be put at risk by mail-portal auth changes.
 */
const createMailApiClient = () => {
  const config = getRuntimeConfig();

  const instance = axios.create({
    baseURL: config.serverUrl || import.meta.env.VITE_API_URL,
  });

  instance.interceptors.request.use(async (request) => {
    const token = localStorage.getItem("mail_token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        mailLogoutHandler("/mail/login");
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

let mailApiClientInstance: AxiosInstance | null = null;

const getMailApiClient = () => {
  if (!mailApiClientInstance) {
    mailApiClientInstance = createMailApiClient();
  }
  return mailApiClientInstance;
};

export default getMailApiClient;
