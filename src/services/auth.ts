import { getRuntimeConfig } from "@/lib/config";
import axios from "axios";
import getApiClient from "./apiClient";
import { LoginSchemaType, RegisterSchemaType } from "@/lib/schemas/auth";
import type { SignupPayload } from "@/components/auth/signup/schemas";

/**
 * OAuth gateway token exchange for authorization code flow
 */
export const loginService = async (params: { code: string }) => {
  const config = getRuntimeConfig();
  try {
    const gatewayUrl = config.apiGatewayUrl ? `${config.apiGatewayUrl}/oauth/exchange` : `${import.meta.env.VITE_API_GATEWAY_URL}/oauth/exchange`;
    const response = await axios.post(gatewayUrl, { code: params.code });
    return response.data;
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};

/**
 * Direct email/password login
 */
export const directLoginService = async (params: LoginSchemaType) => {
  const { data } = await getApiClient().post('/auth/login', {
    email: params.email,
    password: params.password,
  });
  return data;
};

/**
 * User registration with email/password
 */
export const registrationService = async (params: RegisterSchemaType) => {
  const { data } = await getApiClient().post('/auth/register', {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    phone: params.phone,
    location: params.location
  });
  return data;
};

/**
 * Multi-step signup with account type and company details
 */
export const signupService = async (payload: SignupPayload) => {
  const { data } = await getApiClient().post('/auth/register', payload);
  return data;
};

/**
 * Request password reset email
 */
export const forgotPasswordService = async (email: string) => {
  const { data } = await getApiClient().post('/auth/reset-password', { email });
  return data;
};

/**
 * Confirm password reset with new password
 */
export const resetPasswordService = async (token: string, password: string) => {
  const { data } = await getApiClient().post('/auth/reset-password/confirm', {
    token,
    password
  });
  return data;
};

/**
 * Verify email with token
 */
export const verifyEmailService = async (token: string) => {
  const { data } = await getApiClient().get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return data;
};
