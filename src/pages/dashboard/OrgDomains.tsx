import { OrgDomainsManager } from "@/components/organization/OrgDomainsManager";

const OrgDomains = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="heading-section">Domains</h1>
        <p className="text-content-secondary text-sm">
          Custom domains and sender identities for your whole organization.
        </p>
      </div>
      <OrgDomainsManager />
    </div>
  );
};

export default OrgDomains;
