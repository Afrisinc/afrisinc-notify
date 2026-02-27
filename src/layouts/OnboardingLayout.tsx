import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 h-16 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Notifyr</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
