import SignupForm from "@/components/auth/signup/SignupForm";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6 relative">
      <BackgroundDecorator />
      <div className="relative z-10">
        <SignupForm />
      </div>
    </div>
  );
};

export default Register;
