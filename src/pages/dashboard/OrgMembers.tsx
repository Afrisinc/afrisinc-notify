import { useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, Crown, User, Trash2, Mail, Clock, Check, X } from "lucide-react";
import { useOrganizationMembers, useOrganizationInvites, useUserInvites, useAcceptInvite, useDeclineInvite, useRemoveOrganizationMember, useCreateOrganizationInvite } from "@/hooks/useOrganization";
import { useCurrentAccountId } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SearchInput } from "@/components/ui/search-input";
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

  const accountId = useCurrentAccountId();

  // Fetch members - all hooks must be called before any early returns
  const { data: membersData, isLoading: isMembersLoading, error: membersError } = useOrganizationMembers(currentOrg?.id || "");
  const { data: invitesData, isLoading: isInvitesLoading, error: invitesError } = useOrganizationInvites(currentOrg?.id || "");
  const { data: userInvitesData, isLoading: isUserInvitesLoading } = useUserInvites();
  const inviteMutation = useCreateOrganizationInvite();
  const removeMutation = useRemoveOrganizationMember();
  const acceptMutation = useAcceptInvite();
  const declineMutation = useDeclineInvite();

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
  console.log("Members API Response:", { membersData, error: membersError });

  const members = membersData?.members || [];
  const invites = invitesData?.invites || [];

  const filteredMembers = members.filter(
    (m) =>
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.firstName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvites = invites.filter(
    (i) => i.status === "pending" &&
           new Date(i.expiresAt) > new Date() &&
           i.email.toLowerCase().includes(search.toLowerCase())
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

    if (!accountId) {
      toast({
        title: "Error",
        description: "Account ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        orgId: currentOrg.id,
        accountId: accountId,
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
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  if (currentOrg?.name === "Personal") {
    const userInvites = (userInvitesData?.invites || []).filter(
      (invite: any) => invite.status !== "expired" && new Date(invite.expiresAt) > new Date()
    );
    
    if (isUserInvitesLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      );
    }

    return (
      <div className="space-y-6 flex flex-col">
        <div>
          <h1 className="text-2xl font-semibold text-content">My Pending Invites</h1>
          <p className="text-sm text-content-secondary mt-1">
            Accept or decline invitations to join organizations.
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-0">
            {userInvites.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                <Mail className="h-8 w-8 text-border opacity-50" />
                <p>No pending invitations at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {userInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-content">{invite.orgName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-content-secondary">
                            Invited as {invite.role.charAt(0) + invite.role.slice(1).toLowerCase()}
                          </p>
                          <span className="text-content-secondary text-xs">•</span>
                          <span className="text-xs flex items-center bg-warning/10 text-warning px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Clock className="w-3 h-3 mr-1" /> Pending (Expires {new Date(invite.expiresAt).toLocaleDateString()})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={declineMutation.isPending || acceptMutation.isPending}
                        onClick={async () => {
                           try {
                             await declineMutation.mutateAsync({
                               inviteId: invite.id,
                               token: invite.token,
                             });
                             toast({ title: "Success", description: "Invite declined successfully" });
                           } catch (err) {
                             toast({ title: "Error", description: "Failed to decline invite", variant: "destructive" });
                           }
                        }}
                      >
                        <X className="h-4 w-4 mr-2" /> 
                        {declineMutation.isPending ? "Declining..." : "Decline"}
                      </Button>
                      <Button 
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={acceptMutation.isPending || declineMutation.isPending}
                        onClick={async () => {
                           try {
                             await acceptMutation.mutateAsync({
                               inviteId: invite.id,
                               token: invite.token,
                             });
                             toast({ title: "Success", description: "Invite accepted successfully" });
                           } catch (err) {
                             toast({ title: "Error", description: "Failed to accept invite", variant: "destructive" });
                           }
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" /> 
                        {acceptMutation.isPending ? "Accepting..." : "Accept"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMembersLoading || isInvitesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (membersError || invitesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-content">Members & Invites</h1>
          <p className="text-sm text-content-secondary mt-1">
            {currentOrg.name} · Error loading current members or invites
          </p>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive mb-4">
              Failed to load organization members or invites.
            </p>
            <p className="text-xs text-content-secondary">
              Error: {(membersError || invitesError) instanceof Error ? (membersError || invitesError)?.message : "Unknown error"}
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
          <h1 className="text-2xl font-semibold text-content">Members & Invites</h1>
          <p className="text-sm text-content-secondary mt-1">
            {currentOrg.name} · {members.length} member{members.length !== 1 ? "s" : ""} · {invites.filter((i) => i.status === "pending" && new Date(i.expiresAt) > new Date()).length} pending invite{invites.filter((i) => i.status === "pending" && new Date(i.expiresAt) > new Date()).length !== 1 ? "s" : ""}
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

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search members..."
        size="sm"
        className="max-w-sm"
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-content mb-3 flex items-center gap-2">
            <User className="h-5 w-5" /> Current Members
          </h2>
          <div className="space-y-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
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
                      <span className="text-[10px] text-content-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                      {member.role !== "OWNER" && (
                        <AlertDialog open={deleteUserId === member.userId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                  <p className="text-sm text-muted-foreground">No current members found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Pending Invites Section */}
        <div>
          <h2 className="text-lg font-medium text-content mb-3 mt-6 flex items-center gap-2">
            <Mail className="h-5 w-5" /> Pending Invites
          </h2>
          <div className="space-y-2">
            {filteredInvites.length > 0 ? (
              filteredInvites.map((invite) => (
                <Card key={invite.id} className="border-border/60 opacity-80">
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-content">{invite.email}</p>
                        <p className="text-xs text-warning flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          Pending - Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] flex items-center gap-1 ${roleBadge(invite.role)}`}>
                        {roleIcon(invite.role)} {invite.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No pending invites</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
