import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrganizations } from "@/hooks/useAuth";

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  plan?: string;
  createdAt?: string;
  apps?: any[];
}

interface OrgContextType {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
  allOrgs: Organization[];
  loading: boolean;
  error?: string;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data: orgsData, isLoading: orgsLoading, error: orgsError } = useUserOrganizations({
    enabled: !!user && !authLoading,
  });

  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedOrgId = localStorage.getItem("selected_org_id");
    if (savedOrgId) {
      // Store the ID to use when organizations are fetched
      sessionStorage.setItem("pending_org_id", savedOrgId);
    }
    setInitialized(true);
  }, []);

  // Update allOrgs and currentOrg when data is fetched
  useEffect(() => {
    if (orgsData?.data?.organizations && initialized) {
      const organizations = orgsData.data.organizations;
      setAllOrgs(organizations);

      // Check if there's a pending organization ID from localStorage
      const pendingOrgId = sessionStorage.getItem("pending_org_id");
      const savedOrgId = localStorage.getItem("selected_org_id");
      const targetOrgId = pendingOrgId || savedOrgId;

      // Find the organization or default to first one
      const matchedOrg = organizations.find((org) => org.id === targetOrgId);
      const defaultOrg = matchedOrg || organizations[0];

      if (defaultOrg && (!currentOrg || currentOrg.id !== defaultOrg.id)) {
        setCurrentOrg(defaultOrg);
        localStorage.setItem("selected_org_id", defaultOrg.id);
      }

      // Clear pending ID
      sessionStorage.removeItem("pending_org_id");
    }
  }, [orgsData, initialized]);

  // Persist organization selection
  const handleSetCurrentOrg = (org: Organization | null): void => {
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("selected_org_id", org.id);
    }
  };

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        setCurrentOrg: handleSetCurrentOrg,
        allOrgs,
        loading: authLoading || orgsLoading || !initialized,
        error: orgsError ? (orgsError as any).message : undefined,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
