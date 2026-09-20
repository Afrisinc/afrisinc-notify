import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import {
  RecipientForgotPasswordSchema,
  type RecipientForgotPasswordSchemaType,
} from "@/lib/schemas/recipientAuth";
import { useRecipientForgotPassword } from "@/hooks/useRecipientAuth";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";
import FormInput from "@/components/auth/FormInput";

const MailForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const { mutate, isPending } = useRecipientForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipientForgotPasswordSchemaType>({
    resolver: zodResolver(RecipientForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: RecipientForgotPasswordSchemaType) => {
    mutate(data, { onSuccess: () => setSent(true) });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="heading-subsection">Reset your password</h1>
          <p className="heading-description">
            Enter your email and we'll send you reset instructions
          </p>
        </div>
        <AuthCard>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="heading-label">Check your email</h2>
              <p className="text-secondary text-sm">
                If that account exists, we've sent a reset link.
              </p>
              <Link to="/mail/login">
                <Button variant="outline" className="w-full mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormInput
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
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

export default MailForgotPassword;
