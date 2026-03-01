import axios, { AxiosInstance } from 'axios';
import { logoutHandler } from '@/lib/authUtils';
import { getRuntimeConfig } from '@/lib/config';

const createApiClient = () => {
    const config = getRuntimeConfig();

    const token = localStorage.getItem("token");
    const instance = axios.create({
        baseURL: config.serverUrl ||  import.meta.env.VITE_API_URL
    });

    instance.interceptors.request.use(async (request) => {
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }

        return request;
    });

    instance.interceptors.response.use((response) => response, (error) => {
        // Handle explicit token errors
        const isTokenError =
            error?.response?.data?.error?.name === "TokenExpiredError" ||
            error?.response?.data?.error === "Token was not provided" ||
            error?.response?.data?.error?.message === "Token was not provided";

        const is401WithTokenMessage =
            error?.response?.status === 401 &&
            (error?.response?.data?.message?.toLowerCase()?.includes("token") ||
                error?.response?.data?.resp_msg?.toLowerCase()?.includes("token") ||
                (typeof error?.response?.data?.error === 'string' && error?.response?.data?.error?.toLowerCase()?.includes("token")));

        // Only logout on explicit authentication failures
        if (isTokenError || is401WithTokenMessage) {
            logoutHandler();
        }

        return Promise.reject(error);
    });

    return instance;
}

let apiClientInstance: AxiosInstance | null = null;

const getApiClient = () => {
    if (!apiClientInstance) {
        apiClientInstance = createApiClient();
    }
    return apiClientInstance;
}

export default getApiClient;