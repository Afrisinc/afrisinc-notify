import { useEffect } from "react";
import { useRecipientAuth } from "@/contexts/RecipientAuthContext";

const MailProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { recipient, token, loading } = useRecipientAuth();

  useEffect(() => {
    if (!loading && (!recipient || !token)) {
      window.location.replace("/mail/login");
    }
  }, [loading, recipient, token]);

  if (loading || !recipient || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default MailProtectedRoute;
