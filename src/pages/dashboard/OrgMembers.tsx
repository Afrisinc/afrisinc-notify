import { useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { members as allMembers, type OrgMember } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Shield, Crown, User } from "lucide-react";

export default function OrgMembers() {
  const { currentOrg } = useOrg();
  const [search, setSearch] = useState("");

  const orgMembers = allMembers
    .filter((m) => m.orgId === currentOrg.id)
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));

  const roleIcon = (role: OrgMember["role"]) => {
    switch (role) {
      case "owner": return <Crown className="h-3 w-3 text-warning" />;
      case "admin": return <Shield className="h-3 w-3 text-primary" />;
      default: return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const roleBadge = (role: OrgMember["role"]) => {
    switch (role) {
      case "owner": return "bg-warning/15 text-warning";
      case "admin": return "bg-primary/15 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentOrg.name} · {orgMembers.length} member{orgMembers.length !== 1 ? "s" : ""}</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" /> Invite Member
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {orgMembers.map((member) => (
          <Card key={member.id} className="border-border/60">
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold">
                  {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-[10px] flex items-center gap-1 ${roleBadge(member.role)}`}>
                  {roleIcon(member.role)} {member.role}
                </Badge>
                <span className="text-[10px] text-muted-foreground">Joined {member.joinedAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
