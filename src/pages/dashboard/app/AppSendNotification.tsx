import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appTemplates, contacts as allContacts } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Check } from "lucide-react";

export default function AppSendNotification() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const templates = appTemplates.filter((t) => t.appId === appId && t.status === "active");
  const contacts = allContacts.filter((c) => c.appId === appId);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Notification Sent!</h2>
        <p className="text-sm text-muted-foreground mt-1">The notification has been queued for delivery.</p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => setSent(false)}>Send Another</Button>
          <Button onClick={() => navigate(`/dashboard/apps/${appId}/notifications`)}>View Notifications</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/dashboard/apps/${appId}/notifications`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">Send Notification</h2>
      </div>

      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-sm">Notification Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Channel</Label>
            <Select defaultValue="email">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in-app">In-App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Template</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name} ({t.channel})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Recipient</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select a contact" /></SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Or enter a custom recipient below</p>
          </div>

          <div><Label>Custom Recipient</Label><Input placeholder="email@example.com or +1234567890" /></div>

          <Button className="w-full" onClick={() => setSent(true)}>
            <Send className="h-4 w-4 mr-2" /> Send Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
