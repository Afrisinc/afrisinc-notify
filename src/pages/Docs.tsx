import { Code2, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs text-muted-foreground">
        <span>{language}</span>
        <button onClick={copy} className="hover:text-foreground transition-colors">
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto text-foreground">{code}</pre>
    </div>
  );
};

const Docs = () => {
  return (
    <div className="min-h-screen">
      <div className="container max-w-3xl py-16 space-y-12">
        <div className="flex flex-col items-center">
          <img src="/notify-logo.svg" alt="Notify Logo" style={{ width: 80, height: 80 }} />
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4 mt-4">
            <Code2 className="h-3 w-3" /> Developer Documentation
          </div>
          <h1 className="text-3xl font-bold mb-3">Getting Started with Notifyr API</h1>
          <p className="text-muted-foreground">
            Send notifications programmatically using our REST API. This guide covers authentication,
            sending your first notification, and using templates.
          </p>
        </div>

        {/* Auth */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Authentication</h2>
          <p className="text-sm text-muted-foreground">
            All API requests require an API key passed in the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">Authorization</code> header.
            Generate keys from the <strong>API Keys</strong> page in your dashboard.
          </p>
          <CodeBlock
            language="http"
            code={`GET /api/v1/notifications
Authorization: Bearer ntfr_sk_live_abc123def456`}
          />
        </section>

        {/* Send */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Send a Notification</h2>
          <p className="text-sm text-muted-foreground">
            Use the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">POST /api/v1/send</code> endpoint
            to deliver email, SMS, or push notifications.
          </p>
          <CodeBlock
            language="curl"
            code={`curl -X POST https://api.notifyr.dev/v1/send \\
  -H "Authorization: Bearer ntfr_sk_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "email",
    "to": "user@example.com",
    "template_id": "tpl_welcome",
    "data": {
      "name": "Jane",
      "company": "Acme"
    }
  }'`}
          />
          <h3 className="text-sm font-semibold mt-4">Response</h3>
          <CodeBlock
            language="json"
            code={`{
  "id": "ntf_01HX...",
  "status": "queued",
  "channel": "email",
  "created_at": "2026-02-27T14:30:00Z"
}`}
          />
        </section>

        {/* Templates */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Using Templates</h2>
          <p className="text-sm text-muted-foreground">
            Templates let you define reusable message formats. Use <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{{variable}}"}</code> placeholders
            and pass data at send time.
          </p>
          <CodeBlock
            language="javascript"
            code={`import { Notifyr } from "@notifyr/node";

const notifyr = new Notifyr("ntfr_sk_live_abc123");

await notifyr.send({
  channel: "sms",
  to: "+15550123",
  template: "otp_code",
  data: { code: "482901" },
});`}
          />
        </section>

        {/* Channels */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Channels</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { ch: "Email", desc: "HTML or plain-text transactional emails." },
              { ch: "SMS", desc: "Short messages via global carrier network." },
              { ch: "Push", desc: "Browser and mobile push notifications." },
            ].map(({ ch, desc }) => (
              <div key={ch} className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">{ch}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rate Limits */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Rate Limits</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Plan</th>
                  <th className="text-left font-medium px-4 py-3">Requests/min</th>
                  <th className="text-left font-medium px-4 py-3">Monthly limit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3">Free</td>
                  <td className="px-4 py-3 font-mono text-xs">60</td>
                  <td className="px-4 py-3 font-mono text-xs">1,000</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3">Pro</td>
                  <td className="px-4 py-3 font-mono text-xs">600</td>
                  <td className="px-4 py-3 font-mono text-xs">50,000</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Enterprise</td>
                  <td className="px-4 py-3 font-mono text-xs">Unlimited</td>
                  <td className="px-4 py-3 font-mono text-xs">Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Docs;
