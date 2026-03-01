import { useEffect } from "react";
import { getRuntimeConfig } from "@/lib/config";

/**
 * Registration is handled by auth.afrisinc.com (Afrisinc Identity Platform).
 * Visiting /signup redirects there so the user can create an account and be
 * sent back to /app with a bearer token in the URL (?_at=).
 */
const Signup = () => {
  useEffect(() => {
    try {
      const { authUiUrl } = getRuntimeConfig();
      if (authUiUrl) {
        const callbackUrl = encodeURIComponent(`${window.location.origin}/app`);
        window.location.replace(
          `${authUiUrl}/register?redirect_uri=${callbackUrl}&product=notify`
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

export default Signup;
