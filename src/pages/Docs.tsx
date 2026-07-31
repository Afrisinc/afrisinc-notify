import { useState, useCallback, useEffect, useRef } from "react";
import { Code2, Copy, CheckCheck } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { DocsSidebar } from "@/components/public/docs/DocsSidebar";
import { DocsSearch } from "@/components/public/docs/DocsSearch";
import { APIBuilder } from "@/components/public/docs/APIBuilder";

// Labels shown in the code block header can be friendlier than the
// underlying Prism grammar name (e.g. "curl" is highlighted as bash).
const PRISM_LANGUAGE: Record<string, string> = {
  curl: "bash",
  http: "http",
  bash: "bash",
  json: "json",
  javascript: "javascript",
  python: "python",
};

const CodeBlock = ({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 text-xs text-zinc-400">
        <span>{language}</span>
        <button
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <CheckCheck className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={PRISM_LANGUAGE[language] ?? "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.8125rem",
          overflowX: "auto",
        }}
        codeTagProps={{ style: { fontFamily: "inherit" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const SDKTabs = ({
  tabs,
}: {
  tabs: { label: string; language: string; code: string }[];
}) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === i
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-foreground/60 hover:text-foreground border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock
        code={tabs[activeTab].code}
        language={tabs[activeTab].language}
      />
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
      { id: "sdks", title: "SDK Libraries" },
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
  {
    id: "intro",
    title: "Introduction",
    content: "Notify is a multi-channel notification platform.",
  },
  {
    id: "auth",
    title: "Authentication",
    content:
      "All API requests require an API key passed in the Authorization header.",
  },
  {
    id: "first-call",
    title: "Your First API Call",
    content:
      "A quickstart example showing the fastest way to send your first notification with curl or an SDK.",
  },
  {
    id: "sdks",
    title: "SDK Libraries",
    content:
      "Official client libraries for JavaScript/Node and Python to send notifications without raw HTTP calls.",
  },
  {
    id: "send",
    title: "Send Notification",
    content:
      "Use the POST /api/v1/send endpoint to deliver email, SMS, or push notifications.",
  },
  {
    id: "templates",
    title: "Templates",
    content:
      "Templates let you define reusable message formats with variable placeholders.",
  },
  {
    id: "channels",
    title: "Channels",
    content: "We support Email, SMS, and Push notification channels.",
  },
  {
    id: "variables",
    title: "Using Variables",
    content:
      "How to define and pass dynamic variable placeholders into templates at send time.",
  },
  {
    id: "rate-limits",
    title: "Rate Limits",
    content:
      "Rate limits vary by plan from 60 to unlimited requests per minute.",
  },
  {
    id: "api-explorer",
    title: "API Explorer",
    content: "Interactive API endpoint tester for sending test requests.",
  },
];

const Docs = () => {
  const [activeId, setActiveId] = useState("intro");
  // Suppress the scroll-spy briefly after a sidebar click so the smooth
  // scroll animation doesn't flicker through intermediate sections.
  const suppressObserverRef = useRef(false);

  const handleNavigate = useCallback((id: string) => {
    suppressObserverRef.current = true;
    setActiveId(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      suppressObserverRef.current = false;
    }, 700);
  }, []);

  // Keep the sidebar's active item in sync when the user scrolls manually
  // instead of clicking a nav link.
  useEffect(() => {
    const sectionIds = NAV_ITEMS.flatMap((item) =>
      item.children.map((child) => child.id),
    );
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      // Treat a section as "active" once it's within the top ~30% of the
      // viewport, well before it scrolls fully into view.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <BackgroundDecorator />
      <div className="container py-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/notify-logo.png"
              alt="Notify Logo"
              className="h-10 w-10"
            />
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-1">
                <Code2 className="h-3 w-3" /> Developer Documentation
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Notify API Docs
              </h1>
            </div>
          </div>
          <DocsSearch
            sections={SEARCHABLE_SECTIONS}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <DocsSidebar
            items={NAV_ITEMS}
            activeId={activeId}
            onNavigate={handleNavigate}
          />

          <div className="flex-1 max-w-3xl space-y-12">
            {/* Intro */}
            <section id="intro" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Introduction
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Notify lets you send notifications programmatically using our
                REST API. This guide covers authentication, sending your first
                notification, and using templates.
              </p>
            </section>

            {/* Auth */}
            <section id="auth" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Authentication
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                All API requests require an API key passed in the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  Authorization
                </code>{" "}
                header. Generate keys from the <strong>API Keys</strong> page in
                your dashboard.
              </p>
              <CodeBlock
                language="http"
                code={`GET /api/v1/notifications\nAuthorization: Bearer ntfr_sk_live_abc123def456`}
              />
            </section>

            {/* First API Call */}
            <section id="first-call" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Your First API Call
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Three steps to your first notification:
              </p>
              <ol className="text-sm text-foreground/70 dark:text-foreground/80 list-decimal list-inside space-y-1">
                <li>
                  Grab an API key from the <strong>API Keys</strong> page in
                  your dashboard.
                </li>
                <li>
                  Install the Node.js or Python SDK — see{" "}
                  <a href="#sdks" className="text-primary hover:underline">
                    SDK Libraries
                  </a>
                  .
                </li>
                <li>Call send() with a channel, recipient, and template.</li>
              </ol>
              <CodeBlock
                language="javascript"
                code={`import { Notify } from '@afrisinc/notify-sdk';\n\nconst notify = new Notify({ apiKey: "nf_live_••••••••••••" });\n\nawait notify.send({\n  to: "user@example.com",\n  channel: "email",\n  template: "welcome-v2",\n  payload: { name: "Alice" }\n});`}
              />
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Prefer raw HTTP, or need Python? See{" "}
                <a href="#send" className="text-primary hover:underline">
                  Send a Notification
                </a>{" "}
                for curl, or{" "}
                <a href="#sdks" className="text-primary hover:underline">
                  SDK Libraries
                </a>{" "}
                for every language.
              </p>
            </section>

            {/* Send */}
            <section id="send" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Send a Notification
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Use the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  POST /api/notify/send
                </code>{" "}
                endpoint to deliver email, SMS, or push notifications.
              </p>
              <CodeBlock
                language="curl"
                code={`curl -X POST https://notify-api.afrisinc.com/api/notify/send \\\n  -H "Authorization: Bearer ntfr_sk_live_abc123" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "channel": "email",\n    "to": "user@example.com",\n    "templateId": "tpl_welcome",\n    "payload": {\n      "name": "Jane",\n      "company": "Acme"\n    }\n  }'`}
              />
              <h3 className="text-sm font-semibold mt-4 text-foreground">
                Response
              </h3>
              <CodeBlock
                language="json"
                code={`{\n  "id": "ntf_01HX...",\n  "status": "queued",\n  "channel": "email",\n  "created_at": "2026-02-27T14:30:00Z"\n}`}
              />
              <h3 className="text-sm font-semibold mt-4 text-foreground">
                Error Responses
              </h3>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Failed requests return a non-2xx status with a JSON error body:
              </p>
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="border-b border-border text-foreground/70 dark:text-foreground/80">
                      <th className="text-left font-medium px-4 py-3">
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        400
                      </td>
                      <td className="px-4 py-3 text-foreground/70 dark:text-foreground/80">
                        Malformed request — missing or invalid field
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        401
                      </td>
                      <td className="px-4 py-3 text-foreground/70 dark:text-foreground/80">
                        Missing, invalid, or revoked API key
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        404
                      </td>
                      <td className="px-4 py-3 text-foreground/70 dark:text-foreground/80">
                        Template or resource ID not found
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        429
                      </td>
                      <td className="px-4 py-3 text-foreground/70 dark:text-foreground/80">
                        Rate limit exceeded — see{" "}
                        <a
                          href="#rate-limits"
                          className="text-primary hover:underline"
                        >
                          Rate Limits
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        500
                      </td>
                      <td className="px-4 py-3 text-foreground/70 dark:text-foreground/80">
                        Unexpected server error — safe to retry
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <CodeBlock
                language="json"
                code={`{\n  "error": {\n    "type": "invalid_request",\n    "message": "Field 'to' is required",\n    "status": 400\n  }\n}`}
              />
            </section>

            {/* SDKs */}
            <section id="sdks" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                SDK Libraries
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Official client libraries wrap the REST API so you don't have to
                construct requests by hand. Both support all channels,
                templates, and variable substitution.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">
                    Node.js / JavaScript
                  </h3>
                  <CodeBlock
                    language="bash"
                    code={`npm install @afrisinc/notify-sdk`}
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-foreground">
                    Python
                  </h3>
                  <CodeBlock
                    language="bash"
                    code={`pip install afrisinc-notify-sdk`}
                  />
                </div>
              </div>
              <SDKTabs
                tabs={[
                  {
                    label: "Node.js",
                    language: "javascript",
                    code: `import { Notify } from '@afrisinc/notify-sdk';\n\nconst notify = new Notify({\n  apiKey: "nf_live_••••••••••••"\n});\n\nawait notify.send({\n  to: "user@example.com",\n  channel: "email",\n  template: "welcome-v2",\n  payload: { name: "Alice" }\n});`,
                  },
                  {
                    label: "Python",
                    language: "python",
                    code: `from afrisinc_notify import Notify\n\nnotify = Notify("nf_live_••••••••••••")\n\nnotify.send(\n  to="user@example.com",\n  channel="email",\n  template="welcome-v2",\n  payload={ "name": "Alice" }\n)`,
                  },
                ]}
              />
            </section>

            {/* Templates */}
            <section id="templates" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Using Templates
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Templates let you define reusable message formats. Use{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  {"{{variable}}"}
                </code>{" "}
                placeholders and pass data at send time.
              </p>
              <CodeBlock
                language="javascript"
                code={`import { Notify } from "@afrisinc/notify-sdk";\n\nconst notify = new Notify({ apiKey: "ntfr_sk_live_abc123" });\n\nawait notify.send({\n  channel: "sms",\n  to: "+15550123",\n  template: "otp_code",\n  payload: { code: "482901" },\n});`}
              />
            </section>

            {/* Variables */}
            <section id="variables" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Using Variables
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Any{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  {"{{variable}}"}
                </code>{" "}
                placeholder inside a template body is replaced with the matching
                key from the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  data
                </code>{" "}
                object at send time. Missing keys render as an empty string, so
                validate your payload before sending.
              </p>
              <CodeBlock
                language="json"
                code={`{\n  "template": "welcome-v2",\n  "payload": {\n    "name": "Alice",\n    "company": "Acme",\n    "activationUrl": "https://app.example.com/activate/abc"\n  }\n}`}
              />
            </section>

            {/* Channels */}
            <section id="channels" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">Channels</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    ch: "Email",
                    desc: "HTML or plain-text transactional emails.",
                  },
                  {
                    ch: "SMS",
                    desc: "Short messages via global carrier network.",
                  },
                  {
                    ch: "Push",
                    desc: "Browser and mobile push notifications.",
                  },
                ].map(({ ch, desc }) => (
                  <div
                    key={ch}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <h3 className="font-semibold text-sm mb-1 text-foreground">
                      {ch}
                    </h3>
                    <p className="text-xs text-foreground/70 dark:text-foreground/80">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* API Explorer */}
            <section id="api-explorer" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                API Explorer
              </h2>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Test API endpoints interactively. Select an endpoint, configure
                the request, and send.
              </p>
              <APIBuilder />
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="scroll-mt-24 space-y-4">
              <h2 className="text-xl font-bold text-foreground">Rate Limits</h2>
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="border-b border-border text-foreground/70 dark:text-foreground/80">
                      <th className="text-left font-medium px-4 py-3">Plan</th>
                      <th className="text-left font-medium px-4 py-3">
                        Requests/min
                      </th>
                      <th className="text-left font-medium px-4 py-3">
                        Monthly limit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 text-foreground">Free</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        60
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        1,000
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="px-4 py-3 text-foreground">Pro</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        600
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        50,000
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground">Enterprise</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        Unlimited
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        Custom
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3 className="text-sm font-semibold mt-4 text-foreground">
                Response Headers
              </h3>
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                Every response includes your current usage so you can back off
                before hitting the limit:
              </p>
              <CodeBlock
                language="http"
                code={`X-RateLimit-Limit: 60\nX-RateLimit-Remaining: 42\nX-RateLimit-Reset: 1772203200`}
              />
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                If you exceed the limit, the API returns{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  429 Too Many Requests
                </code>{" "}
                with a{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                  Retry-After
                </code>{" "}
                header (in seconds). Wait for that duration before retrying —
                retrying immediately in a loop will keep failing and can extend
                your cooldown.
              </p>
              <CodeBlock
                language="json"
                code={`{\n  "error": {\n    "type": "rate_limit_exceeded",\n    "message": "Too many requests. Retry after 12 seconds.",\n    "status": 429\n  }\n}`}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
