import { useState } from "react";
import { marketplaceTemplates, organizations, apps, type MarketplaceTemplate } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Search, Download, Star, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ChannelFilter = "all" | "email" | "sms" | "push" | "in-app";
type PriceFilter = "all" | "free" | "paid";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [installTemplate, setInstallTemplate] = useState<MarketplaceTemplate | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0].id);
  const [selectedAppId, setSelectedAppId] = useState("");
  const { toast } = useToast();

  const filtered = marketplaceTemplates.filter((t) => {
    if (channelFilter !== "all" && t.channel !== channelFilter) return false;
    if (priceFilter === "free" && t.price > 0) return false;
    if (priceFilter === "paid" && t.price === 0) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const orgApps = apps.filter((a) => a.orgId === selectedOrgId);

  const channelColor = (ch: string) => {
    switch (ch) {
      case "email": return "bg-primary/15 text-primary";
      case "sms": return "bg-success/15 text-success";
      case "push": return "bg-warning/15 text-warning";
      case "in-app": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleInstall = () => {
    if (!selectedAppId) return;
    toast({
      title: "Template installed",
      description: `"${installTemplate?.name}" has been copied to your app.`,
    });
    setInstallTemplate(null);
    setSelectedAppId("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Template Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and install reusable notification templates</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "email", "sms", "push", "in-app"] as ChannelFilter[]).map((ch) => (
            <Button key={ch} variant={channelFilter === ch ? "default" : "outline"} size="sm" onClick={() => setChannelFilter(ch)} className="text-xs capitalize">
              {ch === "all" ? "All Channels" : ch}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all", "free", "paid"] as PriceFilter[]).map((p) => (
            <Button key={p} variant={priceFilter === p ? "default" : "outline"} size="sm" onClick={() => setPriceFilter(p)} className="text-xs capitalize">
              {p === "all" ? "All Prices" : p}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Store className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No templates found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <Card key={tpl.id} className="border-border/60 hover:border-primary/30 transition-colors flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium leading-tight">{tpl.name}</CardTitle>
                  <Badge variant="secondary" className={`text-[10px] shrink-0 ml-2 ${channelColor(tpl.channel)}`}>{tpl.channel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{tpl.description}</p>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {tpl.rating}</span>
                    <span>{tpl.installs.toLocaleString()} installs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${tpl.price === 0 ? "text-success" : "text-foreground"}`}>
                      {tpl.price === 0 ? "Free" : `$${tpl.price}`}
                    </span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInstallTemplate(tpl)}>
                      <Download className="h-3 w-3 mr-1" /> Install
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">by {tpl.creator}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!installTemplate} onOpenChange={(o) => !o && setInstallTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Template</DialogTitle>
            <DialogDescription>Choose where to install "{installTemplate?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">Organization</Label>
              <Select value={selectedOrgId} onValueChange={(v) => { setSelectedOrgId(v); setSelectedAppId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">App</Label>
              <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                <SelectTrigger><SelectValue placeholder="Select an app" /></SelectTrigger>
                <SelectContent>
                  {orgApps.map((app) => (
                    <SelectItem key={app.id} value={app.id}>{app.name} ({app.environment})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setInstallTemplate(null)} className="flex-1">Cancel</Button>
              <Button disabled={!selectedAppId} onClick={handleInstall} className="flex-1">Install Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
