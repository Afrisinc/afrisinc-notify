import { useEffect } from "react";
import { getRuntimeConfig } from "@/lib/config";

/**
 * Password reset is handled by auth.afrisinc.com (Afrisinc Identity Platform).
 */
const ForgotPassword = () => {
  useEffect(() => {
    try {
      const { authUiUrl } = getRuntimeConfig();
      if (authUiUrl) {
        window.location.replace(`${authUiUrl}/forgot-password`);
      }
    } catch {
      // config not loaded yet
    }
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

export default ForgotPassword;
