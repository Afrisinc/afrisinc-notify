/** Auth utilities for the recipient mail portal identity - see mailApiClient.ts. */

export const mailLogoutHandler = (route?: string): void => {
  localStorage.removeItem("mail_token");
  localStorage.removeItem("mail_user");
  window.location.href = route || "/mail/login";
};
