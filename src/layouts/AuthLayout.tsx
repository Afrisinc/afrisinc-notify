import { Outlet, Link } from "react-router-dom";
import { Zap } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold text-lg mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Notifyr</span>
        </Link>
        <div className="bg-card border border-border rounded-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
