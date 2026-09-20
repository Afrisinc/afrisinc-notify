import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  RecipientSetPasswordSchema,
  type RecipientSetPasswordSchemaType,
} from "@/lib/schemas/recipientAuth";
import { useSetPassword } from "@/hooks/useRecipientAuth";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";
import FormPasswordInput from "@/components/auth/FormPasswordInput";

const MailSetPassword = () => {
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate, isPending } = useSetPassword();
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipientSetPasswordSchemaType>({
    resolver: zodResolver(RecipientSetPasswordSchema),
  });

  const onSubmit = (data: RecipientSetPasswordSchemaType) => {
    if (!token) {
      toast({
        title: "Invalid link",
        description: "This access link is missing its token.",
        variant: "destructive",
      });
      return;
    }
    mutate(
      { token, password: data.password },
      {
        onSuccess: () => setDone(true),
        onError: (error: any) => {
          toast({
            title: "Couldn't set password",
            description:
              error.response?.data?.resp_msg ||
              error.message ||
              "This link may have expired.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="heading-subsection">Set your password</h1>
          <p className="heading-description">
            Choose a password to access your mail
          </p>
        </div>
        <AuthCard>
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="heading-label">Password set</h2>
              <Button
                variant="default"
                className="w-full mt-4"
                onClick={() => navigate("/mail/login")}
              >
                Sign In
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormPasswordInput
                id="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <Button
                variant="default"
                className="w-full"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Set Password"
                )}
              </Button>
              <Link to="/mail/login">
                <Button variant="primary-light" className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </form>
          )}
        </AuthCard>
      </div>
    </div>
  );
};

export default MailSetPassword;
