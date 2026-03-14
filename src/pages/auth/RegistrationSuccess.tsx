import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Check } from "lucide-react";
import Logo from "@/components/Logo";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import AuthCard from "@/components/auth/AuthCard";

const RegistrationSuccess = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const accountType = searchParams.get("type") || "personal";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Logo />
          <div className="mt-6 mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="heading-subsection">Account Created Successfully!</h1>
          <p className="heading-description">
            {accountType === "company"
              ? "Welcome to AfriSinc Notify. Your organization account has been created."
              : "Welcome to AfriSinc Notify. Your account has been created."}
          </p>
        </div>

        <AuthCard>
          <div className="space-y-6">
            {/* Email Verification Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Verify Your Email
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {email ? (
                      <>
                        We've sent a verification link to <strong>{email}</strong>.
                        Check your inbox and click the link to verify your account.
                      </>
                    ) : (
                      "We've sent a verification link to your email. Click it to verify your account."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 space-y-3">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                What's next?
              </p>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">1.</span>
                  <span>Check your email for the verification link</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">2.</span>
                  <span>Click the link to confirm your email address</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">3.</span>
                  <span>Return here and sign in to get started</span>
                </li>
              </ol>
            </div>

            {/* Didn't receive email */}
            <div className="text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Didn't receive the email? Check your spam folder or{" "}
                <button className="form-link font-semibold">
                  request a new verification link
                </button>
                .
              </p>
            </div>

            {/* Sign In Button */}
            <Link to="/login" className="block">
              <Button variant="default" className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </AuthCard>

        {/* Footer links */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Need help?{" "}
          <a href="mailto:support@afrisinc.com" className="form-link font-semibold">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
