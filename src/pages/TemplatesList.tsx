import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Mail, MessageSquare, Bell } from "lucide-react";

const mockTemplates = [
  { id: "1", name: "Welcome Email", channel: "Email", updated: "2 hours ago", status: "active" },
  { id: "2", name: "OTP Code", channel: "SMS", updated: "1 day ago", status: "active" },
  { id: "3", name: "New Feature Announcement", channel: "Push", updated: "3 days ago", status: "draft" },
  { id: "4", name: "Invoice Notification", channel: "Email", updated: "1 week ago", status: "active" },
  { id: "5", name: "Password Reset", channel: "Email", updated: "2 weeks ago", status: "active" },
];

const channelIcon: Record<string, React.ElementType> = {
  Email: Mail,
  SMS: MessageSquare,
  Push: Bell,
};

const TemplatesList = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = mockTemplates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.channel === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your notification templates.</p>
        </div>
        <Link
          to="/app/templates/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Template
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {["all", "Email", "SMS", "Push"].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilter(ch)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === ch
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {ch === "all" ? "All" : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Channel</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const Icon = channelIcon[t.channel] || Mail;
              return (
                <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/app/templates/${t.id}`} className="hover:text-primary transition-colors">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {t.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TemplatesList;
