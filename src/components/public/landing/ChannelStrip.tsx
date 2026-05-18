import { Mail, MessageSquare, Bell, Layers } from "lucide-react";

const CHANNELS = [
  { icon: Mail, label: "Email", desc: "Transactional & marketing" },
  { icon: MessageSquare, label: "SMS", desc: "Instant text delivery" },
  { icon: Bell, label: "Push", desc: "Mobile & web notifications" },
  { icon: Layers, label: "In-app", desc: "Contextual UI alerts" },
];

export function ChannelStrip() {
  return (
    <div className="border-y border-border/60 py-7 bg-card/50">
      <div className="container flex items-center justify-between flex-wrap gap-6">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          One API for every channel
        </span>
        <div className="flex gap-8 flex-wrap">
          {CHANNELS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
