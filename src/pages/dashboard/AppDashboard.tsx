import { useParams, useNavigate } from "react-router-dom";
import { apps, appTemplates } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Key, Activity, Settings, Send, Plus, Copy, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AppDashboard() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const app = apps.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-medium text-foreground">App not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/apps")}>Back to Apps</Button>
      </div>
    );
  }

  const templates = appTemplates.filter((t) => t.appId === app.id);

  const channelColor = (ch: string) => {
    switch (ch) {
      case "email": return "bg-primary/15 text-primary";
      case "sms": return "bg-success/15 text-success";
      case "push": return "bg-warning/15 text-warning";
      case "in-app": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-success/15 text-success";
      case "draft": return "bg-muted text-muted-foreground";
      case "archived": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/apps")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{app.name}</h1>
          <p className="text-sm text-muted-foreground">{app.description || app.environment}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          app.environment === "production" ? "bg-success/15 text-success" :
          app.environment === "staging" ? "bg-warning/15 text-warning" :
          "bg-muted text-muted-foreground"
        }`}>
          {app.environment}
        </span>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Templates", value: app.templateCount, icon: FileText },
              { label: "Notifications Sent", value: app.notificationsSent.toLocaleString(), icon: Send },
              { label: "API Keys", value: app.apiKeyCount, icon: Key },
            ].map((s) => (
              <Card key={s.label} className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/marketplace")}>
                  <Store className="h-3.5 w-3.5 mr-1.5" /> Import from Marketplace
                </Button>
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Template
                </Button>
              </div>
            </div>

            {templates.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No templates yet. Create one or import from the marketplace.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {templates.map((tpl) => (
                  <Card key={tpl.id} className="border-border/60">
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{tpl.name}</span>
                          <span className="text-xs text-muted-foreground">v{tpl.version} · {tpl.updatedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-[10px] ${channelColor(tpl.channel)}`}>{tpl.channel}</Badge>
                        <Badge variant="secondary" className={`text-[10px] ${statusColor(tpl.status)}`}>{tpl.status}</Badge>
                        <div className="flex gap-1 ml-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card className="border-border/60">
            <CardContent className="py-12 text-center">
              <Key className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">API key management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-border/60">
            <CardContent className="py-12 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Notification logs coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-border/60">
            <CardContent className="py-12 text-center">
              <Settings className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">App settings coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Small inline icon to avoid importing Store at top level (used in template actions)
function Store(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
