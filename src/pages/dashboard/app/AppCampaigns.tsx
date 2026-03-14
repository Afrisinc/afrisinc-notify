import { useState } from "react";
import { useParams } from "react-router-dom";
import { campaigns as allCampaigns, appTemplates } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Megaphone, Send, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  draft: { icon: AlertCircle, color: "text-muted-foreground" },
  scheduled: { icon: Clock, color: "text-warning" },
  sending: { icon: Send, color: "text-primary" },
  completed: { icon: CheckCircle2, color: "text-success" },
  failed: { icon: XCircle, color: "text-destructive" },
};

export default function AppCampaigns() {
  const { appId } = useParams();
  const campaigns = allCampaigns.filter((c) => c.appId === appId);
  const templates = appTemplates.filter((t) => t.appId === appId);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => { setStep(1); setShowCreate(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Campaign
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No campaigns yet. Create one to start sending bulk notifications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((camp) => {
            const cfg = statusConfig[camp.status];
            const Icon = cfg.icon;
            const tpl = appTemplates.find((t) => t.id === camp.templateId);
            return (
              <Card key={camp.id} className="border-border/60 hover:border-border transition-colors">
                <CardContent className="flex items-center justify-between py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-muted ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground truncate block">{camp.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tpl?.name || "Unknown template"} · {camp.recipientCount} recipients
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="text-[10px]">{camp.channel}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{camp.status}</Badge>
                    {camp.status === "completed" && (
                      <span className="text-xs text-muted-foreground">
                        {camp.deliveredCount}/{camp.sentCount} delivered
                      </span>
                    )}
                    {camp.scheduledAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(camp.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Campaign Builder Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Create Campaign — Step {step} of 4
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div><Label>Campaign Name</Label><Input placeholder="e.g. Welcome Series" /></div>
              <div>
                <Label>Channel</Label>
                <Select defaultValue="email">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Select Template</Label>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No templates available. Create one first.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {templates.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.channel} · v{t.version}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{t.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Select Recipients</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="tags">Specific Tags</SelectItem>
                  <SelectItem value="list">Uploaded List</SelectItem>
                  <SelectItem value="manual">Manual Emails</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Or paste emails here (one per line)..." rows={4} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>When to send?</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border-2 border-primary text-center cursor-pointer">
                  <Send className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Send Now</p>
                </div>
                <div className="p-4 rounded-lg border-2 border-border text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                </div>
              </div>
              <Input type="datetime-local" />
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
                </Button>
              )}
            </div>
            <div>
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => setShowCreate(false)}>
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Launch Campaign
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
