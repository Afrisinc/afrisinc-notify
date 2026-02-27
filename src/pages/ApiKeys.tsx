import { useState } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const initialKeys: ApiKey[] = [
  { id: "1", name: "Production", key: "ntfy_live_sk_a1b2c3d4e5f6", created: "Feb 20, 2026", lastUsed: "2 min ago" },
  { id: "2", name: "Development", key: "ntfy_test_sk_x7y8z9w0v1u2", created: "Feb 15, 2026", lastUsed: "1 day ago" },
];

const ApiKeys = () => {
  const [keys, setKeys] = useState(initialKeys);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const handleCreate = () => {
    const newKey: ApiKey = {
      id: String(Date.now()),
      name: `Key ${keys.length + 1}`,
      key: `ntfy_test_sk_${Math.random().toString(36).slice(2, 14)}`,
      created: "Just now",
      lastUsed: "Never",
    };
    setKeys([newKey, ...keys]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your API credentials.</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Generate Key
        </button>
      </div>

      <div className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{k.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs font-mono text-muted-foreground">
                  {showKey[k.id] ? k.key : k.key.slice(0, 12) + "••••••••••••"}
                </code>
                <button
                  onClick={() => setShowKey({ ...showKey, [k.id]: !showKey[k.id] })}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showKey[k.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Created: {k.created}</span>
                <span>Last used: {k.lastUsed}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(k.key, k.id)}
                className="h-8 px-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors inline-flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied === k.id ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => handleRevoke(k.id)}
                className="h-8 px-3 text-xs border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeys;
