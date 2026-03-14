import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import { apps, organizations } from "@/data/mockData";
import { useOrg } from "@/contexts/OrgContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Bell,
  FileText,
  Users,
  Megaphone,
  Key,
  ScrollText,
  Settings,
  ArrowLeft,
  Send,
  Upload,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const appNav = [
  { title: "Overview", path: "", icon: LayoutDashboard },
  { title: "Notifications", path: "notifications", icon: Bell },
  { title: "Templates", path: "templates", icon: FileText },
  { title: "Contacts", path: "contacts", icon: Users },
  { title: "Campaigns", path: "campaigns", icon: Megaphone },
  { title: "API Keys", path: "api-keys", icon: Key },
  { title: "Logs", path: "logs", icon: ScrollText },
  { title: "Settings", path: "settings", icon: Settings },
];

const envColor = (env: string) => {
  switch (env) {
    case "production": return "bg-success/15 text-success border-success/30";
    case "staging": return "bg-warning/15 text-warning border-warning/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

export default function AppDashboardLayout() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrg, loading: orgLoading } = useOrg();
  const app = apps.find((a) => a.id === appId);

  // Wait for organization to load
  if (orgLoading || !currentOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
          <div className="h-4 w-64 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-medium text-foreground">App not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/apps")}>
          Back to Apps
        </Button>
      </div>
    );
  }

  const basePath = `/dashboard/apps/${appId}`;
  const currentSub = location.pathname.replace(basePath, "").replace(/^\//, "");

  return (
    <div className="animate-fade-in">
      {/* ── Top Header ── */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/dashboard/apps")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground truncate">{app.name}</h1>
              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium border", envColor(app.environment))}>
                {app.environment}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentOrg.name} · {app.description || "No description"}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => navigate(`${basePath}/notifications/send`)}>
            <Send className="h-3.5 w-3.5 mr-1.5" /> Send Notification
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/contacts`)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Import Contacts
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/templates`)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/api-keys`)}>
            <Key className="h-3.5 w-3.5 mr-1.5" /> API Keys
          </Button>
        </div>
      </div>

      {/* ── Secondary Navigation ── */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto pb-px">
        {appNav.map((item) => {
          const isActive = currentSub === item.path || (item.path === "" && currentSub === "");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path ? `${basePath}/${item.path}` : basePath)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.title}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <Outlet />
    </div>
  );
}
