import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoginSchema, type LoginSchemaType } from "@/lib/schemas/auth";
import { jwtDecode } from "jwt-decode";
import { useDirectLogin } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";
import FormInput from "@/components/auth/FormInput";
import FormPasswordInput from "@/components/auth/FormPasswordInput";
import FormCheckbox from "@/components/auth/FormCheckbox";

const Login = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Priority: redirect_uri param → router state → /dashboard
  const redirectUri = searchParams.get("redirect_uri");
  const productParam = searchParams.get("product");
  const from = redirectUri || location.state?.from?.pathname || "/dashboard";

  const { mutate, isPending } = useDirectLogin();

  const onSubmit = (data: LoginSchemaType) => {
    const payload = {
      ...data,
      ...(productParam && { product_code: productParam })    
    };
    mutate(payload as LoginSchemaType, {
      onSuccess: (res: any) => {
        if (res.success && res.resp_code === 1000) {
          const token: string = res.data.token || "";

          localStorage.setItem("notify_token", token);
          localStorage.setItem(
            "notify_user",
            JSON.stringify({
              id: res.data.user_id,
              email: res.data.email,
            })
          );

          toast({ title: "Welcome back!", description: "You've successfully signed in." });

          let destination: string = "/dashboard";

          window.location.href = destination;
        } else {
          toast({
            title: "Login Failed",
            description: res.resp_msg || "Invalid credentials",
            variant: "destructive",
          });
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Login Failed",
          description: error.message || "Login failed",
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
         <Logo/>
          <h1 className="heading-subsection">Welcome back</h1>
          <p className="heading-description">
            {productParam
              ? `Sign in to access ${productParam}`
              : "Sign in to your account"}
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

            <div className="flex justify-between text-sm">
              <FormCheckbox label="Remember me" />
              <Link to="/forgot-password" className="form-link">
                Forgot password?
              </Link>
            </div>

            <Button variant="default" className="w-full" type="submit" disabled={isPending}>
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
            Don't have an account?{" "}
            <Link to="/signup" className="form-link font-semibold">
              Sign up
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
};

export default Login;
