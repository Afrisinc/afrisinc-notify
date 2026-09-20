import getMailApiClient from "./mailApiClient";
import type {
  RecipientRequestAccessSchemaType,
  RecipientLoginSchemaType,
  RecipientForgotPasswordSchemaType,
} from "@/lib/schemas/recipientAuth";

export const requestAccessService = async (
  params: RecipientRequestAccessSchemaType,
) => {
  const { data } = await getMailApiClient().post(
    "/api/mail/auth/request-access",
    params,
  );
  return data;
};

export const setPasswordService = async (token: string, password: string) => {
  const { data } = await getMailApiClient().post(
    "/api/mail/auth/set-password",
    { token, password },
  );
  return data;
};

export const recipientLoginService = async (
  params: RecipientLoginSchemaType,
) => {
  const { data } = await getMailApiClient().post(
    "/api/mail/auth/login",
    params,
  );
  return data;
};

export const recipientForgotPasswordService = async (
  params: RecipientForgotPasswordSchemaType,
) => {
  const { data } = await getMailApiClient().post(
    "/api/mail/auth/forgot-password",
    params,
  );
  return data;
};

export const recipientResetPasswordService = async (
  token: string,
  password: string,
) => {
  const { data } = await getMailApiClient().post(
    "/api/mail/auth/reset-password",
    { token, password },
  );
  return data;
};
