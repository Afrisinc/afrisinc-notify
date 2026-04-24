import { useState } from "react";
import { Play, Copy, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  body?: string;
}

const ENDPOINTS: APIEndpoint[] = [
  {
    method: "POST",
    path: "/v1/send",
    description: "Send a notification",
    body: JSON.stringify(
      {
        channel: "email",
        to: "user@example.com",
        template_id: "tpl_welcome",
        data: { name: "Jane" },
      },
      null,
      2,
    ),
  },
  {
    method: "GET",
    path: "/v1/notifications",
    description: "List notifications",
  },
  { method: "GET", path: "/v1/templates", description: "List templates" },
  {
    method: "POST",
    path: "/v1/templates",
    description: "Create a template",
    body: JSON.stringify(
      {
        name: "Welcome",
        type: "email",
        subject: "Welcome!",
        content: "<h1>Hello {{name}}</h1>",
      },
      null,
      2,
    ),
  },
  {
    method: "DELETE",
    path: "/v1/notifications/:id",
    description: "Delete notification",
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-success/10 text-success",
  POST: "bg-primary/10 text-primary",
  PUT: "bg-warning/10 text-warning",
  DELETE: "bg-destructive/10 text-destructive",
};

export function APIBuilder({
  baseUrl = "https://api.notifyr.dev",
}: {
  baseUrl?: string;
}) {
  const [selected, setSelected] = useState(ENDPOINTS[0]);
  const [body, setBody] = useState(ENDPOINTS[0].body || "");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEndpointChange = (path: string) => {
    const ep = ENDPOINTS.find((e) => e.path === path)!;
    setSelected(ep);
    setBody(ep.body || "");
    setResponse(null);
  };

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setResponse(
        JSON.stringify(
          {
            id: "ntf_01HX" + Math.random().toString(36).slice(2, 8),
            status: "queued",
            channel: "email",
            created_at: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      setLoading(false);
    }, 800);
  };

  const copyCode = () => {
    const curl = `curl -X ${selected.method} ${baseUrl}${selected.path} \\\n  -H "Authorization: Bearer ntfr_sk_live_..." \\\n  -H "Content-Type: application/json"${body ? ` \\\n  -d '${body}'` : ""}`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-sm font-semibold text-foreground">
          API Explorer
        </span>
        <button
          onClick={copyCode}
          className="text-xs text-foreground/70 dark:text-foreground/80 hover:text-foreground flex items-center gap-1"
        >
          {copied ? (
            <CheckCheck className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy as cURL"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Badge className={`shrink-0 ${METHOD_COLORS[selected.method]}`}>
            {selected.method}
          </Badge>
          <Select value={selected.path} onValueChange={handleEndpointChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENDPOINTS.map((ep) => (
                <SelectItem key={ep.path} value={ep.path}>
                  {ep.path} — {ep.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(selected.method === "POST" || selected.method === "PUT") && (
          <div>
            <label className="text-xs font-medium text-foreground/70 dark:text-foreground/80 mb-1 block">
              Request Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-36 bg-background border border-border rounded-lg p-3 font-mono text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={loading}
          className="w-full"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {loading ? "Sending..." : "Send Request"}
        </Button>

        {response && (
          <div>
            <label className="text-xs font-medium text-foreground/70 dark:text-foreground/80 mb-1 block">
              Response
            </label>
            <pre className="bg-background border border-border rounded-lg p-3 font-mono text-xs text-foreground overflow-x-auto">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
