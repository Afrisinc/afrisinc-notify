import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRuntimeConfig } from "@/lib/config";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !token)) {
      try {
        const { authUiUrl } = getRuntimeConfig();
        const callbackUrl = encodeURIComponent(window.location.href);
        const target = authUiUrl || "";

        if (target) {
          window.location.replace(
            `${target}/login?redirect_uri=${callbackUrl}&product=notify`
          );
        } else {
          // authUiUrl not configured — fall back to local /login
          window.location.replace("/login");
        }
      } catch {
        window.location.replace("/login");
      }
    }
  }, [loading, user, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !token) {
    // Show spinner while the redirect effect fires
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
