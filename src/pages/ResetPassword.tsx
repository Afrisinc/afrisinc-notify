import { useEffect } from "react";
import { getRuntimeConfig } from "@/lib/config";

/**
 * Password reset confirmation is handled by auth.afrisinc.com.
 * Email reset links point directly to auth-ui, so this page is
 * only reached if someone navigates here directly.
 */
const ResetPassword = () => {
  useEffect(() => {
    try {
      const { authUiUrl } = getRuntimeConfig();
      if (authUiUrl) {
        // Forward any ?token= param so auth-ui can process it
        const token = new URLSearchParams(window.location.search).get("token");
        const target = token
          ? `${authUiUrl}/reset-password?token=${token}`
          : `${authUiUrl}/forgot-password`;
        window.location.replace(target);
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

export default ResetPassword;
