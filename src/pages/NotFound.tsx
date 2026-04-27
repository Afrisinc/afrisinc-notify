import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero relative">
      <BackgroundDecorator />
      <div className="text-center relative z-10">
        <h1 className="mb-4 text-4xl font-bold dark:text-white">404</h1>
        <p className="mb-4 text-xl text-foreground/75 dark:text-foreground/80">
          Oops! Page not found
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
