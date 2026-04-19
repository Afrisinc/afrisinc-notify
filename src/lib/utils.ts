import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  return { loginUrl: "/login", signupUrl: "/signup" };
}

/**
 * Get form value from localStorage
 * @param key - localStorage key
 * @param defaultValue - value if key not found
 */
export function getFormValue<T = string>(key: string, defaultValue?: T): T | string | null {
  try {
    const value = localStorage.getItem(key);
    return value || defaultValue || null;
  } catch {
    return defaultValue || null;
  }
}

/**
 * Get multiple form values from localStorage
 * @param keys - object with key mapping: { email: "form_email", password: "form_password" }
 */
export function getFormValues<T extends Record<string, string>>(keys: T): Partial<Record<keyof T, string>> {
  const values: Partial<Record<keyof T, string>> = {};
  Object.entries(keys).forEach(([field, storageKey]) => {
    try {
      const value = localStorage.getItem(storageKey as string);
      if (value) {
        (values as any)[field] = value;
      }
    } catch {
      // silently ignore localStorage errors
    }
  });
  return values;
}

/**
 * Save form values to localStorage
 * @param values - object with key/value pairs to store
 * @param prefix - optional prefix for all keys (e.g., "form_email" for key "email")
 */
export function saveFormValues(values: Record<string, string>, prefix = ""): void {
  try {
    Object.entries(values).forEach(([key, value]) => {
      const storageKey = prefix ? `${prefix}${key}` : key;
      if (value) {
        localStorage.setItem(storageKey, value);
      } else {
        localStorage.removeItem(storageKey);
      }
    });
  } catch {
    // silently ignore localStorage errors
  }
}

/**
 * Clear form values from localStorage
 * @param keys - keys to clear
 */
export function clearFormValues(keys: string[]): void {
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // silently ignore localStorage errors
  }
}

/**
 * Extract error message from backend API response or native Error
 * Handles axios errors, Error objects, and unknown types
 * @param error - error object from API call or thrown exception
 * @param defaultMessage - fallback message if extraction fails
 */
export function getErrorMessage(error: unknown, defaultMessage = "An error occurred"): string {
  // Axios error with response data
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    return (
      axiosError.response?.data?.resp_msg ||
      axiosError.response?.data?.message ||
      axiosError.response?.statusText ||
      defaultMessage
    );
  }

  // Native Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  // Unknown type
  return defaultMessage;
}
