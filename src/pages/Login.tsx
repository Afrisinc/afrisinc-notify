import { useEffect } from "react";
import { getRuntimeConfig } from "@/lib/config";

/**
 * Auth is handled by auth.afrisinc.com (Afrisinc Identity Platform).
 * Visiting /login redirects there so the user can sign in and be
 * sent back to /app with a bearer token in the URL (?_at=).
 */
const Login = () => {
  useEffect(() => {
    try {
      const { authUiUrl } = getRuntimeConfig();
      if (authUiUrl) {
        const callbackUrl = encodeURIComponent(`${window.location.origin}/app`);
        window.location.replace(
          `${authUiUrl}/login?redirect_uri=${callbackUrl}&product=notify`
        );
      }
    } catch {
      // config not loaded yet — spinner stays
    }
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
};

export default Login;
