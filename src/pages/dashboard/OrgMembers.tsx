import { useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Shield, Crown, User, Trash2 } from "lucide-react";
import { useOrganizationMembers, useRemoveOrganizationMember, useCreateOrganizationInvite } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrgMembers() {
  const { currentOrg, loading: orgLoading } = useOrg();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Fetch members - all hooks must be called before any early returns
  const { data: membersData, isLoading, error } = useOrganizationMembers(currentOrg?.id || "");
  const inviteMutation = useCreateOrganizationInvite();
  const removeMutation = useRemoveOrganizationMember();

  // Handle missing organization - early return AFTER all hooks
  if (!currentOrg) {
    if (orgLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading organization...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">No organization selected</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Log API response for debugging
  console.log("Members API Response:", { membersData, error });

  const members = membersData?.members || [];
  const filtered = members.filter(
    (m) =>
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.firstName.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        orgId: currentOrg.id,
        payload: {
          email: inviteEmail,
          role: inviteRole,
        },
      });

      toast({
        title: "Success",
        description: `Invite sent to ${inviteEmail}`,
      });

      setInviteEmail("");
      setInviteRole("MEMBER");
      setShowInvite(false);
    } catch (error) {
      const axiosError = error as { response?: { data?: {resp_msg?:string; message?: string } }; message?: string };
      const errorMessage = axiosError?.response?.data?.resp_msg || axiosError?.response?.data?.message || axiosError?.message || "Failed to send invite";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteUserId) return;

    try {
      await removeMutation.mutateAsync({
        orgId: currentOrg.id,
        memberId: deleteUserId,
      });

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      setDeleteUserId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-3 w-3 text-warning" />;
      case "ADMIN":
        return <Shield className="h-3 w-3 text-primary" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-warning/15 text-warning";
      case "ADMIN":
        return "bg-primary/15 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-content">Members</h1>
          <p className="text-sm text-content-secondary mt-1">
            {currentOrg.name} · Error loading members
          </p>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive mb-4">
              Failed to load organization members. The endpoint may not be available yet.
            </p>
            <p className="text-xs text-content-secondary">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-content">Members</h1>
          <p className="text-sm text-content-secondary mt-1">
            {currentOrg.name} · {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Invite Member
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>Send an invitation to join your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={(value: "MEMBER" | "ADMIN") => setInviteRole(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 icon-muted" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((member) => (
            <Card key={member.userId} className="border-border/60">
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold">
                    {getInitials(member.firstName, member.lastName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-content-secondary">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-[10px] flex items-center gap-1 ${roleBadge(member.role)}`}>
                    {roleIcon(member.role)} {member.role}
                  </Badge>
                  <span className="text-[10px] text-content-secondary">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                  {member.role !== "OWNER" && (
                    <AlertDialog open={deleteUserId === member.userId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteUserId(member.userId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.firstName} {member.lastName} from the organization?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogAction
                          onClick={handleRemoveMember}
                          className="bg-destructive"
                          disabled={removeMutation.isPending}
                        >
                          {removeMutation.isPending ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No members found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
