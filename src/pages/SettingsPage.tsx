import { useState } from "react";
import { Building2, Mail, Image, Save, MapPin, Globe, User } from "lucide-react";

const tenantTypes = ["Personal", "Company", "Enterprise"] as const;

const SettingsPage = () => {
  const [company, setCompany] = useState("Acme Inc.");
  const [tenantType, setTenantType] = useState<string>("Company");
  const [industry, setIndustry] = useState("Technology");
  const [website, setWebsite] = useState("https://acme.com");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("San Francisco");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [senderName, setSenderName] = useState("Acme Notifications");
  const [senderEmail, setSenderEmail] = useState("notifications@acme.com");
  const [replyTo, setReplyTo] = useState("support@acme.com");

  const inputClass =
    "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your tenant configuration.</p>
      </div>

      {/* Tenant Type */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" /> Account Type
        </h2>
        <div className="flex gap-3">
          {tenantTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTenantType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tenantType === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Company / Tenant Info */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />{" "}
          {tenantType === "Personal" ? "Profile" : "Organization"} Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              {tenantType === "Personal" ? "Full name" : "Organization name"}
            </label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
          </div>
          {tenantType !== "Personal" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Industry</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} placeholder="e.g. Technology, Healthcare" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website
            </label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Logo</label>
          <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer">
            <Image className="h-6 w-6" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Upload your logo (PNG, SVG).</p>
        </div>
      </section>

      {/* Location */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" /> Location
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Country</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Timezone</label>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass} placeholder="e.g. America/New_York" />
          </div>
        </div>
      </section>

      {/* Sender Config */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" /> Sender Configuration
        </h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">Sender name</label>
          <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Sender email</label>
          <input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Reply-to email</label>
          <input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className={inputClass} />
        </div>
      </section>

      <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
        <Save className="h-4 w-4" /> Save changes
      </button>
    </div>
  );
};

export default SettingsPage;
