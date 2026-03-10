import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRuntimeConfig } from "@/lib/config";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";
import FormPasswordInput from "@/components/auth/FormPasswordInput";
import { useState } from "react";

const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (formData: ResetPasswordForm) => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "Reset token is missing. Please request a new reset link.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const config = getRuntimeConfig();
      const response = await fetch(`${config.serverUrl}/auth/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Reset Failed",
          description: errorData.resp_msg || "Password reset failed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setDone(true);
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo/>
          <h1 className="heading-subsection">Set new password</h1>
          <p className="heading-description">
            Choose a strong password for your account
          </p>
        </div>

        <AuthCard>
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="heading-label">Password updated</h2>
              <p className="text-secondary text-sm">
                Your password has been reset successfully.
              </p>
              <Button variant="default" className="w-full mt-4" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormPasswordInput
                id="password"
                label="New Password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <FormPasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button variant="default" className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Link to="/login">
                <Button variant="primary-light" className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </form>
          )}
        </AuthCard>
      </div>
    </div>
  );
};

export default ResetPassword;
