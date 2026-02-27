import { useState } from "react";
import { Send, Mail, MessageSquare, Bell, Plus, X } from "lucide-react";

const channels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "push", label: "Push", icon: Bell },
] as const;

const mockTemplates = [
  { id: "tpl-1", name: "Welcome Email", channel: "email" },
  { id: "tpl-2", name: "OTP Code", channel: "sms" },
  { id: "tpl-3", name: "New Feature Alert", channel: "push" },
  { id: "tpl-4", name: "Invoice", channel: "email" },
  { id: "tpl-5", name: "Shipping Update", channel: "sms" },
];

const SendNotification = () => {
  const [channel, setChannel] = useState("email");
  const [template, setTemplate] = useState("");
  const [recipients, setRecipients] = useState<string[]>([""]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const filteredTemplates = mockTemplates.filter((t) => t.channel === channel);
  const inputClass =
    "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const addRecipient = () => setRecipients([...recipients, ""]);
  const removeRecipient = (i: number) => setRecipients(recipients.filter((_, idx) => idx !== i));
  const updateRecipient = (i: number, val: string) => {
    const copy = [...recipients];
    copy[i] = val;
    setRecipients(copy);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Send Notification</h1>
        <p className="text-sm text-muted-foreground mt-1">Compose and send a notification to one or multiple recipients.</p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {/* Channel */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm">Channel</h2>
          <div className="flex gap-3">
            {channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setChannel(ch.id);
                  setTemplate("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  channel === ch.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <ch.icon className="h-4 w-4" /> {ch.label}
              </button>
            ))}
          </div>
        </section>

        {/* Template & Recipients */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Template (optional)</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className={inputClass}
            >
              <option value="">— No template —</option>
              {filteredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              {channel === "email" ? "Recipients (email)" : channel === "sms" ? "Recipients (phone)" : "Recipients (user ID)"}
            </label>
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={r}
                    onChange={(e) => updateRecipient(i, e.target.value)}
                    className={inputClass}
                    placeholder={
                      channel === "email" ? "user@example.com" : channel === "sms" ? "+1 555-0123" : "user_id_123"
                    }
                  />
                  {recipients.length > 1 && (
                    <button type="button" onClick={() => removeRecipient(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRecipient}
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add recipient
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-sm">Content</h2>
          {channel === "email" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="Notification subject" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {channel === "email" ? "Body (HTML or text)" : "Message"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={channel === "email" ? 8 : 4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder={channel === "email" ? "<h1>Hello {{name}}</h1>" : "Your code is {{code}}"}
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Send className="h-4 w-4" /> Send notification
        </button>

        {sent && (
          <div className="bg-success/10 text-success text-sm font-medium px-4 py-3 rounded-lg animate-fade-in">
            ✓ Notification sent successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default SendNotification;
