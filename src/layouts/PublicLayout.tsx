import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { getAuthUrls } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, FileText, DollarSign, BookOpen, LogIn, X } from "lucide-react";

const PublicLayout = () => {
  const { user } = useAuth();
  const { loginUrl, signupUrl } = getAuthUrls();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Templates", href: "/templates", icon: FileText },
    { label: "Pricing", href: "/pricing", icon: DollarSign },
    { label: "Docs", href: "/docs", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-1 font-semibold text-lg text-foreground">
            <img src="/notify-logo.png" alt="Notify Logo" className="h-9 w-9 rounded-lg p-1" />
            <span>Notify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <a href={loginUrl} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </a>
            )}
            <ThemeToggle />
            {user ? (
              <Button asChild variant="primary-solid" size="sm">
                <Link to="/dashboard">Go to App</Link>
              </Button>
            ) : (
              <Button asChild variant="primary-solid" size="sm">
                <a href={signupUrl}>Get Started</a>
              </Button>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background">
                <div className="absolute right-4 top-4">
                  <SheetClose asChild>
                    <Button variant="ghost" size="sm" className="text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <div className="flex flex-col gap-6 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="flex items-center gap-3 text-sm font-medium text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4 text-foreground dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                        {item.label}
                      </Link>
                    );
                  })}
                  {!user && (
                    <a
                      href={loginUrl}
                      className="flex items-center gap-3 text-sm font-medium text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary transition-colors group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4 text-foreground dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                      Login
                    </a>
                  )}
                  <div className="pt-4 border-t border-border dark:border-border">
                    {user ? (
                      <Button asChild variant="primary-solid" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/dashboard">Go to App</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="primary-solid" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <a href={signupUrl}>Get Started</a>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
