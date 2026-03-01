import { Outlet, Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { getAuthUrls } from "@/lib/utils";

const PublicLayout = () => {
  const { loginUrl, signupUrl } = getAuthUrls();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <img src="/notify-logo.svg" alt="Notify Logo" className="h-8 w-8 rounded-lg bg-white p-1" />
            <span>Notify</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <a href={loginUrl} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </a>
            <a
              href={signupUrl}
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
