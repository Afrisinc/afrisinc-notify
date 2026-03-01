import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getRuntimeConfig } from "@/lib/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build auth-ui URLs with redirect_uri and product params.
 * Config is guaranteed to be loaded before any component renders
 * (main.tsx awaits loadRuntimeConfig() first).
 * Falls back to local routes if authUiUrl is not configured.
 */
export function getAuthUrls() {
  try {
    const { authUiUrl } = getRuntimeConfig();
    if (authUiUrl) {
      const callbackUrl = encodeURIComponent(`${window.location.origin}/app`);
      return {
        loginUrl: `${authUiUrl}/login?product=notify`,
        signupUrl: `${authUiUrl}/register?redirect_uri=${callbackUrl}&product=notify`,
      };
    }
  } catch {
    // config not ready — fallback to local routes
  }
  return { loginUrl: "/login", signupUrl: "/signup" };
}
