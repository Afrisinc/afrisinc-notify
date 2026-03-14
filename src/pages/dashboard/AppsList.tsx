import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "@/contexts/OrgContext";
import { apps as allApps, type App } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Boxes, ArrowRight, Search } from "lucide-react";

export default function AppsList() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEnv, setNewEnv] = useState<App["environment"]>("development");
  const [newDesc, setNewDesc] = useState("");

  const orgApps = allApps
    .filter((a) => a.orgId === currentOrg.id)
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  const envColor = (env: string) => {
    switch (env) {
      case "production": return "bg-success/15 text-success";
      case "staging": return "bg-warning/15 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Apps</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentOrg.name} · {orgApps.length} app{orgApps.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create App
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {orgApps.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Boxes className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No apps yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first app to start sending notifications.</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create App
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgApps.map((app) => (
            <Card
              key={app.id}
              className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => navigate(`/dashboard/apps/${app.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{app.name}</CardTitle>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${envColor(app.environment)}`}>
                    {app.environment}
                  </span>
                </div>
                {app.description && (
                  <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex gap-4">
                    <span>{app.templateCount} templates</span>
                    <span>{app.notificationsSent.toLocaleString()} sent</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New App</DialogTitle>
            <DialogDescription>Add a new app to {currentOrg.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">App Name</Label>
              <Input placeholder="e.g., Production App" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Environment</Label>
              <Select value={newEnv} onValueChange={(v) => setNewEnv(v as App["environment"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Description (optional)</Label>
              <Input placeholder="What is this app for?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
              <Button disabled={!newName.trim()} className="flex-1" onClick={() => setShowCreate(false)}>Create App</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
