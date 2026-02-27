import { useState } from "react";
import { Search, Filter, Mail, MessageSquare, Bell } from "lucide-react";

const mockNotifications = [
  { id: "ntf-001", channel: "Email", to: "john@example.com", template: "Welcome Email", status: "delivered", date: "2026-02-27 14:23" },
  { id: "ntf-002", channel: "SMS", to: "+1 555-0123", template: "OTP Code", status: "delivered", date: "2026-02-27 14:18" },
  { id: "ntf-003", channel: "Push", to: "user_abc", template: "New Feature", status: "failed", date: "2026-02-27 14:05" },
  { id: "ntf-004", channel: "Email", to: "jane@example.com", template: "Invoice", status: "delivered", date: "2026-02-27 13:50" },
  { id: "ntf-005", channel: "Email", to: "team@acme.com", template: "Weekly Report", status: "delivered", date: "2026-02-27 12:00" },
  { id: "ntf-006", channel: "SMS", to: "+44 7700 900000", template: "Shipping Update", status: "pending", date: "2026-02-27 11:45" },
];

const statusColor: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

const channelIcon: Record<string, React.ElementType> = {
  Email: Mail, SMS: MessageSquare, Push: Bell,
};

const NotificationsList = () => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = mockNotifications.find((n) => n.id === selectedId);

  const filtered = mockNotifications.filter(
    (n) => n.to.toLowerCase().includes(search.toLowerCase()) || n.template.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all sent notifications and delivery status.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by recipient or template..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left font-medium px-4 py-3">ID</th>
              <th className="text-left font-medium px-4 py-3">Channel</th>
              <th className="text-left font-medium px-4 py-3">Recipient</th>
              <th className="text-left font-medium px-4 py-3">Template</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => {
              const Icon = channelIcon[n.channel] || Mail;
              return (
                <tr
                  key={n.id}
                  onClick={() => setSelectedId(n.id)}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{n.id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {n.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{n.to}</td>
                  <td className="px-4 py-3">{n.template}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[n.status]}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{n.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer/detail panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border p-6 shadow-xl animate-slide-in-right z-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">Notification Details</h2>
            <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground text-sm">
              ✕
            </button>
          </div>
          <dl className="space-y-4 text-sm">
            {[
              ["ID", selected.id],
              ["Channel", selected.channel],
              ["Recipient", selected.to],
              ["Template", selected.template],
              ["Status", selected.status],
              ["Date", selected.date],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd className="font-medium mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
