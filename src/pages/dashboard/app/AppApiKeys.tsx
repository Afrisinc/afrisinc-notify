import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Key, Copy, Eye, EyeOff, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/hooks/useApps";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppApiKeys() {
  const { appId } = useParams<{ appId: string }>();
  const { toast } = useToast();

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState<"test" | "production">("test");
  const [createdKey, setCreatedKey] = useState<{
    plainKey: string;
    name: string;
  } | null>(null);

  const { data: apiKeysData, isLoading } = useApiKeys(appId!);
  const createMutation = useCreateApiKey();
  const deleteMutation = useDeleteApiKey();

  const keys = apiKeysData?.apiKeys || [];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast({
        title: "Error",
        description: "Key name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        appId: appId!,
        payload: { name: keyName, type: keyType },
      });

      setCreatedKey({
        plainKey: response.plainKey,
        name: response.name,
      });

      setKeyName("");
      setKeyType("test");
      setShowCreate(false);

      toast({
        title: "Success",
        description: "API key created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteMutation.mutateAsync({
        appId: appId!,
        keyId,
      });

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}${"•".repeat(Math.min(20, key.length - 8))}${key.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-content-secondary">
          {keys.length} API key{keys.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Create API Key
        </Button>
      </div>

      {createdKey && (
        <Card className="border-success/50 bg-success/5">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-success">
                ✓ API Key Created
              </p>
              <p className="text-xs text-content-secondary">
                Save this key securely. You will not be able to see it again.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-background/50 p-2 rounded text-xs font-mono break-all">
                  {createdKey.plainKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(createdKey.plainKey, "new-key")}
                >
                  {copied === "new-key" ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatedKey(null)}
                className="w-full"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {keys.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Key className="h-10 w-10 icon-muted mx-auto mb-3" />
            <p className="text-sm text-content-secondary">
              No API keys. Create one to start sending notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <Card key={k.id} className="border-border/60">
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-content">
                      {k.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        k.type === "production"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {k.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-content-secondary font-mono">
                      {showKey[k.id] ? k.id : maskKey(k.id)}
                    </code>
                  </div>
                  <span className="text-[10px] text-content-secondary">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setShowKey((s) => ({ ...s, [k.id]: !s[k.id] }))
                    }
                  >
                    {showKey[k.id] ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleCopy(k.id, k.id)}
                  >
                    {copied === k.id ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently revoke "{k.name}". Any
                          integrations using this key will stop working
                          immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDeleteKey(k.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending
                            ? "Revoking..."
                            : "Revoke Key"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for this app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Key Name</Label>
              <Input
                placeholder="e.g. Production Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={keyType}
                onValueChange={(value: any) => setKeyType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateKey}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
