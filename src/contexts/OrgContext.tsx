import { createContext, useContext, useState, ReactNode } from "react";
import { organizations, type Organization } from "@/data/mockData";

interface OrgContextType {
  currentOrg: Organization;
  setCurrentOrg: (org: Organization) => void;
  allOrgs: Organization[];
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization>(organizations[0]);

  return (
    <OrgContext.Provider value={{ currentOrg, setCurrentOrg, allOrgs: organizations }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
