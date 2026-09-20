import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  RecipientLoginSchema,
  type RecipientLoginSchemaType,
} from "@/lib/schemas/recipientAuth";
import { useRecipientLogin } from "@/hooks/useRecipientAuth";
import { useRecipientAuth } from "@/contexts/RecipientAuthContext";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";
import FormInput from "@/components/auth/FormInput";
import FormPasswordInput from "@/components/auth/FormPasswordInput";

const MailLogin = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { setSession } = useRecipientAuth();
  const { mutate, isPending } = useRecipientLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipientLoginSchemaType>({
    resolver: zodResolver(RecipientLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = (location.state as any)?.from?.pathname || "/mail";

  const onSubmit = (data: RecipientLoginSchemaType) => {
    mutate(data, {
      onSuccess: (res: any) => {
        setSession(res.data.token, res.data.email);
        window.location.href = from;
      },
      onError: (error: any) => {
        toast({
          title: "Sign in failed",
          description:
            error.response?.data?.resp_msg ||
            error.message ||
            "Invalid email or password",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="heading-subsection">Sign in to Mail</h1>
          <p className="heading-description">
            View and reply to messages sent to you
          </p>
        </div>

        <AuthCard>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormPasswordInput
              id="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex justify-end text-sm">
              <Link to="/mail/forgot-password" className="form-link">
                Forgot password?
              </Link>
            </div>

            <Button
              variant="default"
              className="w-full"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="heading-description text-center mt-6">
            New here?{" "}
            <Link to="/mail/request-access" className="form-link font-semibold">
              Get access to your mail
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
};

export default MailLogin;
