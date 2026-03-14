import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apps } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2, Globe, Webhook } from "lucide-react";

export default function AppSettings() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const app = apps.find((a) => a.id === appId);

  if (!app) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> General</CardTitle>
          <CardDescription>Manage your app's basic settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>App Name</Label><Input defaultValue={app.name} /></div>
          <div><Label>Description</Label><Textarea defaultValue={app.description || ""} rows={3} /></div>
          <div>
            <Label>Environment</Label>
            <Select defaultValue={app.environment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Allowed Domains */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Allowed Domains</CardTitle>
          <CardDescription>Restrict API access to specific domains.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder={"https://example.com\nhttps://app.example.com"} rows={3} />
          <Button variant="outline" size="sm">Save Domains</Button>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhooks</CardTitle>
          <CardDescription>Configure webhook endpoints for delivery events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Webhook URL</Label><Input placeholder="https://your-app.com/webhooks/notify" /></div>
          <div>
            <Label>Events</Label>
            <p className="text-xs text-muted-foreground mt-1">notification.delivered, notification.failed, notification.bounced</p>
          </div>
          <Button variant="outline" size="sm">Save Webhook</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" /> Danger Zone</CardTitle>
          <CardDescription>Permanently delete this app and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete App</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{app.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the app and all its templates, contacts, campaigns, API keys, and logs. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => navigate("/dashboard/apps")}>
                  Delete App
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
