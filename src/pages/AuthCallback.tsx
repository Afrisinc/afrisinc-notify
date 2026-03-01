import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";

/**
 * AuthCallback page handles OAuth callback with authorization code.
 * Exchanges the code for a session token and redirects to the app.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { token, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract the code from query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      console.log("Authorization code received:", code);

      if (!code) {
        setError("No authorization code found in URL");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        // Exchange code for session token using auth service
        const response = await loginService({ code });

        const token = response.data?.token || response.token;
        if (!response.success || !token) {
          throw new Error(response.error || response.resp_msg || "Token exchange failed");
        }

        console.log("Token exchange successful, token received:", token);

        // Extract user info from response
        const userData = response.data || {};
        const user = {
          id: userData.user_id || "",
          email: userData.email || "",
          firstName: userData.firstName,
          lastName: userData.lastName,
        };

        // Store token and user in localStorage
        localStorage.setItem("notify_token", token);
        localStorage.setItem("notify_user", JSON.stringify(user));

        // Redirect to app dashboard
        navigate("/app", { replace: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Auth callback error:", message);
        console.log("Full error object:", err);
        setError(message);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  // Wait for AuthContext to pick up the token from localStorage
  useEffect(() => {
    if (!loading && token) {
      // Token is now loaded in AuthContext, navigate to app
      navigate("/app", { replace: true });
    }
  }, [token, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Authentication Failed
            </h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login in 2 seconds...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Processing login...</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your credentials.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
