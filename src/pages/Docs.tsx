import { useState, useCallback } from "react";
import { Code2, Copy, CheckCheck } from "lucide-react";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { DocsSidebar } from "@/components/public/docs/DocsSidebar";
import { DocsSearch } from "@/components/public/docs/DocsSearch";
import { APIBuilder } from "@/components/public/docs/APIBuilder";

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border text-xs text-foreground/70 dark:text-foreground/80">
        <span>{language}</span>
        <button onClick={copy} className="hover:text-foreground transition-colors">
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto text-foreground">{code}</pre>
    </div>
  );
};

const NAV_ITEMS = [
  {
    id: "getting-started",
    title: "Getting Started",
    children: [
      { id: "intro", title: "Introduction" },
      { id: "auth", title: "Authentication" },
      { id: "first-call", title: "Your First API Call" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    children: [
      { id: "send", title: "Send Notification" },
      { id: "templates", title: "Templates" },
      { id: "channels", title: "Channels" },
      { id: "api-explorer", title: "API Explorer" },
    ],
  },
  {
    id: "guides",
    title: "Guides",
    children: [
      { id: "variables", title: "Using Variables" },
      { id: "rate-limits", title: "Rate Limiting" },
    ],
  },
];

const SEARCHABLE_SECTIONS = [
  { id: "intro", title: "Introduction", content: "Notify is a multi-channel notification platform." },
  { id: "auth", title: "Authentication", content: "All API requests require an API key passed in the Authorization header." },
  { id: "send", title: "Send Notification", content: "Use the POST /api/v1/send endpoint to deliver email, SMS, or push notifications." },
  { id: "templates", title: "Templates", content: "Templates let you define reusable message formats with variable placeholders." },
  { id: "channels", title: "Channels", content: "We support Email, SMS, and Push notification channels." },
  { id: "rate-limits", title: "Rate Limits", content: "Rate limits vary by plan from 60 to unlimited requests per minute." },
  { id: "api-explorer", title: "API Explorer", content: "Interactive API endpoint tester for sending test requests." },
];

const Docs = () => {
  const [activeId, setActiveId] = useState("intro");

  const handleNavigate = useCallback((id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <BackgroundDecorator />
      <div className="container py-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <img src="/notify-logo.png" alt="Notify Logo" className="h-10 w-10" />
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-1">
                <Code2 className="h-3 w-3" /> Developer Documentation
              </div>
              <h1 className="text-2xl font-bold dark:text-white">Notify API Docs</h1>
            </div>
          </div>
          <DocsSearch sections={SEARCHABLE_SECTIONS} onNavigate={handleNavigate} />
        </div>

        <div className="flex gap-8">
          <DocsSidebar items={NAV_ITEMS} activeId={activeId} onNavigate={handleNavigate} />

          <div className="flex-1 max-w-3xl space-y-12">
            {/* Intro */}
            <section id="intro" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Introduction</h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Notify lets you send notifications programmatically using our REST API.
                This guide covers authentication, sending your first notification, and using templates.
              </p>
            </section>

            {/* Auth */}
            <section id="auth" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Authentication</h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                All API requests require an API key passed in the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">Authorization</code> header.
                Generate keys from the <strong>API Keys</strong> page in your dashboard.
              </p>
              <CodeBlock
                language="http"
                code={`GET /api/v1/notifications\nAuthorization: Bearer ntfr_sk_live_abc123def456`}
              />
            </section>

            {/* Send */}
            <section id="send" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Send a Notification</h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Use the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">POST /api/v1/send</code> endpoint
                to deliver email, SMS, or push notifications.
              </p>
              <CodeBlock
                language="curl"
                code={`curl -X POST https://api.notifyr.dev/v1/send \\\n  -H "Authorization: Bearer ntfr_sk_live_abc123" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "channel": "email",\n    "to": "user@example.com",\n    "template_id": "tpl_welcome",\n    "data": {\n      "name": "Jane",\n      "company": "Acme"\n    }\n  }'`}
              />
              <h3 className="text-sm font-semibold mt-4 dark:text-white">Response</h3>
              <CodeBlock
                language="json"
                code={`{\n  "id": "ntf_01HX...",\n  "status": "queued",\n  "channel": "email",\n  "created_at": "2026-02-27T14:30:00Z"\n}`}
              />
            </section>

            {/* Templates */}
            <section id="templates" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Using Templates</h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Templates let you define reusable message formats. Use <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{"{{variable}}"}</code> placeholders
                and pass data at send time.
              </p>
              <CodeBlock
                language="javascript"
                code={`import { Notify } from "@notifyr/node";\n\nconst notifyr = new Notify("ntfr_sk_live_abc123");\n\nawait notifyr.send({\n  channel: "sms",\n  to: "+15550123",\n  template: "otp_code",\n  data: { code: "482901" },\n});`}
              />
            </section>

            {/* Channels */}
            <section id="channels" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Channels</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { ch: "Email", desc: "HTML or plain-text transactional emails." },
                  { ch: "SMS", desc: "Short messages via global carrier network." },
                  { ch: "Push", desc: "Browser and mobile push notifications." },
                ].map(({ ch, desc }) => (
                  <div key={ch} className="bg-card border border-border rounded-xl p-4">
                    <h3 className="font-semibold text-sm mb-1 text-foreground dark:text-white">{ch}</h3>
                    <p className="text-xs text-foreground/70 dark:text-foreground/80">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* API Explorer */}
            <section id="api-explorer" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">API Explorer</h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Test API endpoints interactively. Select an endpoint, configure the request, and send.
              </p>
              <APIBuilder />
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold dark:text-white">Rate Limits</h2>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-foreground/70 dark:text-foreground/80">
                      <th className="text-left font-medium px-4 py-3">Plan</th>
                      <th className="text-left font-medium px-4 py-3">Requests/min</th>
                      <th className="text-left font-medium px-4 py-3">Monthly limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 text-foreground dark:text-white">Free</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground dark:text-white">60</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground dark:text-white">1,000</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 text-foreground dark:text-white">Pro</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground dark:text-white">600</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground dark:text-white">50,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground dark:text-white">Enterprise</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground dark:text-white">Unlimited</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground dark:text-white">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
