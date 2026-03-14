import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { OrgProvider } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <OrgProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
              <SidebarTrigger />
              <div className="flex-1" />
              <ThemeToggle />
              {user && (
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                    {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.email}
                  </span>
                </div>
              )}
            </header>
            <main className="flex-1 p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </OrgProvider>
  );
};

export default DashboardLayout;
