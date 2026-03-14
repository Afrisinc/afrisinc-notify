import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useVerifyEmail } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";

type VerifyState = "loading" | "success" | "error" | "idle";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { mutate } = useVerifyEmail();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setState("idle");
      return;
    }

    setState("loading");
    mutate(token, {
      onSuccess: (res: any) => {
        if (res.success && res.resp_code === 1000) {
          setState("success");
          setMessage("Your email has been verified successfully.");
        } else {
          setState("error");
          setMessage(res.resp_msg || "Verification failed. The link may have expired.");
        }
      },
      onError: () => {
        setState("error");
        setMessage("Something went wrong. Please try again.");
      },
    });
  }, [token, mutate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo/>
          <h1 className="heading-subsection">Email Verification</h1>
        </div>

        <AuthCard>
          <div className="text-center space-y-4">
            {state === "idle" && (
            <>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="heading-label">Check your inbox</h2>
              <p className="text-secondary text-sm">
                We sent you a verification link. Click it to activate your account.
              </p>
              <p className="text-secondary text-sm">
                Didn't receive it? Check your spam folder or{" "}
                <Link to="/login" className="text-primary hover:underline">
                  sign in again
                </Link>{" "}
                to resend.
              </p>
            </>
          )}

          {state === "loading" && (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="heading-label">Verifying your email...</h2>
            </>
          )}

          {state === "success" && (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="heading-label">Email verified!</h2>
              <p className="text-secondary text-sm">{message}</p>
              <Button variant="default" className="w-full mt-2" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="heading-label">Verification failed</h2>
              <p className="text-secondary text-sm">{message}</p>
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link to="/forgot-password">Request a new link</Link>
              </Button>
            </>
            )}
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default VerifyEmail;
