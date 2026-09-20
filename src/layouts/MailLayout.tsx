import { Outlet } from "react-router-dom";
import { LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecipientAuth } from "@/contexts/RecipientAuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const MailLayout = () => {
  const { recipient, signOut } = useRecipientAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 flex items-center border-b border-border px-4 gap-3 sticky top-0 z-40 bg-dashboard backdrop-blur-sm">
        <Mail className="h-5 w-5 text-primary" />
        <span className="font-semibold">Mail</span>
        <div className="flex-1" />
        <ThemeToggle />
        {recipient && (
          <span className="text-sm text-content-secondary hidden sm:block">
            {recipient.email}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-1" />
          Sign out
        </Button>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MailLayout;
