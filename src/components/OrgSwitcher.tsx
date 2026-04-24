import { useState } from "react";
import {
  ChevronDown,
  Building2,
  Check,
  Plus,
  Users,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/contexts/OrgContext";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrganization } from "@/hooks/useOrganization";

export function OrgSwitcher() {
  const { currentOrg, setCurrentOrg, allOrgs, loading } = useOrg();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createOrgMutation = useCreateOrganization();
  const collapsed = state === "collapsed";

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [orgName, setOrgName] = useState("");

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createOrgMutation.mutateAsync({
        name: orgName.trim(),
      });

      toast({
        title: "Success",
        description: `Organization "${orgName}" created successfully`,
      });

      setOrgName("");
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create organization",
        variant: "destructive",
      });
    }
  };

  if (loading || !currentOrg || allOrgs.length === 0) {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-accent-foreground">
        <Building2 className="h-4 w-4 shrink-0 text-primary" />
        {!collapsed && (
          <span className="truncate flex-1 text-left">Loading...</span>
        )}
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">
                  {currentOrg?.name}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allOrgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => setCurrentOrg(org)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>{org.name}</span>
              </div>
              {currentOrg.id === org.id && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/dashboard/organization/members")}
            className="flex items-center gap-2"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Members</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/dashboard/organization/settings")}
            className="flex items-center gap-2"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage your apps and collaborators
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name" className="text-sm font-medium">
                Organization Name
              </Label>
              <Input
                id="org-name"
                placeholder="e.g., My Company Inc."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-2"
                disabled={createOrgMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={createOrgMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={createOrgMutation.isPending || !orgName.trim()}
            >
              {createOrgMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
