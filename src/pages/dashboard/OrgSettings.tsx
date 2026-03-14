import { useOrg } from "@/contexts/OrgContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Trash2 } from "lucide-react";

export default function OrgSettings() {
  const { currentOrg } = useOrg();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Organization Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage {currentOrg.name}</p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium mb-1 block">Organization Name</Label>
            <Input defaultValue={currentOrg.name} />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">Slug</Label>
            <Input defaultValue={currentOrg.slug} disabled className="opacity-60" />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium">Plan</Label>
            <Badge variant="secondary" className="bg-primary/15 text-primary text-xs capitalize">{currentOrg.plan}</Badge>
          </div>
          <Button className="mt-2">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Deleting your organization will permanently remove all apps, templates, and data.</p>
          <Button variant="destructive">Delete Organization</Button>
        </CardContent>
      </Card>
    </div>
  );
}
