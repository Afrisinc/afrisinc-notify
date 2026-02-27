import { Mail, MessageSquare, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  { label: "Sent", value: "12,847", change: "+12%", up: true, icon: Mail },
  { label: "Delivered", value: "12,601", change: "+11%", up: true, icon: Bell },
  { label: "Failed", value: "246", change: "-3%", up: false, icon: MessageSquare },
];

const recentActivity = [
  { id: "ntf-001", channel: "Email", to: "john@example.com", template: "Welcome Email", status: "delivered", time: "2 min ago" },
  { id: "ntf-002", channel: "SMS", to: "+1 555-0123", template: "OTP Code", status: "delivered", time: "5 min ago" },
  { id: "ntf-003", channel: "Push", to: "user_abc", template: "New Feature", status: "failed", time: "12 min ago" },
  { id: "ntf-004", channel: "Email", to: "jane@example.com", template: "Invoice", status: "delivered", time: "18 min ago" },
  { id: "ntf-005", channel: "Email", to: "team@acme.com", template: "Weekly Report", status: "delivered", time: "1 hr ago" },
];

const statusColor: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your notification activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${s.up ? "text-success" : "text-destructive"}`}>
              {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {s.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Channel</th>
                <th className="text-left font-medium px-4 py-3">Recipient</th>
                <th className="text-left font-medium px-4 py-3">Template</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{row.channel}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.to}</td>
                  <td className="px-4 py-3">{row.template}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
