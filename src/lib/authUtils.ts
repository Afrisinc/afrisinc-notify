/**
 * Authentication utility functions
 */

import { toast } from 'sonner';
import { jwtDecode } from "jwt-decode";
import { AxiosErrorResponse } from '@/types/response';
import { TokenPayload } from '@/types/shared';

export const logoutHandler = (route?: string): void => {
    localStorage.removeItem("token");
    window.location.href = route || "/signin";
};

export const onError = (error: AxiosErrorResponse) => {
    const errorMessage = error.response?.data.resp_msg || error.response?.data?.message || error.response?.data?.error_msg || error?.message || "Request failed";
    toast.error(errorMessage);
};

export const decodeUserToken = (): TokenPayload => {
    let user = {};

    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decoded: TokenPayload = jwtDecode(token);
            user = decoded;
        } catch (error) {
            console.error("Invalid Token", error);
        }
    }

    return user
}