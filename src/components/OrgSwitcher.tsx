import { ChevronDown, Building2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useOrg } from "@/contexts/OrgContext";
import { useSidebar } from "@/components/ui/sidebar";

export function OrgSwitcher() {
  const { currentOrg, setCurrentOrg, allOrgs, loading } = useOrg();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (loading || !currentOrg || allOrgs.length === 0) {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-accent-foreground">
        <Building2 className="h-4 w-4 shrink-0 text-primary" />
        {!collapsed && <span className="truncate flex-1 text-left">Loading...</span>}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{currentOrg?.name}</span>
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
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
            {currentOrg.id === org.id && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
