/**
 * ChannelEditorPage
 * Route: /editor/:appId/:channel/:templateId
 *
 * Supports: sms | push | in-app | whatsapp
 * Email uses the dedicated EmailEditor / [id].tsx route.
 *
 * API contract:
 *  - code     → UPPER_SNAKE_CASE (backend requires ^[A-Z_]+$)
 *  - content  → plain string used by workers (body text for SMS/Push/In-App/WA)
 *  - subject  → notification title for Push and In-App
 *  - design_json → full editor state for round-trip editing (like email's JSON)
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getAppService } from "@/services/apps";
import {
  getAppTemplateService,
  createAppTemplateService,
  updateAppTemplateService,
} from "@/services/apps";
import { useAppContext } from "@/contexts/AppContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentAccountId } from "@/hooks/useAuth";
import { SmsEditor, type SmsEditorValue } from "@/components/editors/SmsEditor";
import {
  PushEditor,
  type PushEditorValue,
} from "@/components/editors/PushEditor";
import {
  InAppEditor,
  type InAppEditorValue,
} from "@/components/editors/InAppEditor";
import {
  WhatsAppEditor,
  type WhatsAppEditorValue,
} from "@/components/editors/WhatsAppEditor";
import { Loader2 } from "lucide-react";

type ChannelParam = "sms" | "push" | "in-app" | "whatsapp";

/** Transform user-input name to backend-required UPPER_SNAKE_CASE code */
function toTemplateCode(name: string): string {
  const code = name
    .trim()
    .toUpperCase()
    .replace(/[\s\-./]+/g, "_") // spaces, hyphens, dots → underscore
    .replace(/[^A-Z_]/g, "") // strip anything not A-Z or _
    .replace(/^_+|_+$/g, "") // trim leading/trailing underscores
    .replace(/_+/g, "_"); // collapse multiple underscores
  return code || "TEMPLATE";
}

const CHANNEL_TO_API: Record<
  ChannelParam,
  "SMS" | "PUSH" | "IN_APP" | "WHATSAPP"
> = {
  sms: "SMS",
  push: "PUSH",
  "in-app": "IN_APP",
  whatsapp: "WHATSAPP",
};

export default function ChannelEditorPage() {
  const { appId, channel, templateId } = useParams<{
    appId: string;
    channel: ChannelParam;
    templateId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const accountId = useCurrentAccountId();
  const { selectedApp, setSelectedApp } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designJson, setDesignJson] = useState<Record<string, any> | null>(
    null,
  );
  const [existingCode, setExistingCode] = useState<string>("");
  const [existingLanguage, setExistingLanguage] = useState<string>("en");

  const isNew = templateId === "new";
  const safeChannel = (channel ?? "sms") as ChannelParam;
  const backPath = appId
    ? `/dashboard/apps/${appId}/templates`
    : "/dashboard/templates";

  useEffect(() => {
    if (!appId) {
      setError("Missing appId");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedApp || selectedApp.id !== appId) {
          const app = await getAppService(appId);
          setSelectedApp(app);
        }

        if (!isNew && templateId && accountId) {
          const data = await getAppTemplateService(
            appId,
            templateId,
            accountId,
          );
          const tpl = (data as any)?.template || data;
          // Prefer design_json for full editor state; fall back to parsing content
          const dj = tpl.design_json;
          if (dj && typeof dj === "object" && Object.keys(dj).length > 0) {
            setDesignJson(dj);
          } else if (
            typeof tpl.content === "string" &&
            tpl.content.trim().startsWith("{")
          ) {
            try {
              setDesignJson(JSON.parse(tpl.content));
            } catch {
              setDesignJson({ body: tpl.content });
            }
          } else {
            setDesignJson({ body: tpl.content ?? "" });
          }
          setExistingCode(tpl.code ?? "");
          setExistingLanguage(tpl.language ?? "en");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appId, templateId, isNew, accountId]);

  /**
   * Save to API.
   *
   * content  = the plain string used by the worker (body text)
   * subject  = notification title (Push / In-App)
   * design_json = full editor state for round-trip editing
   */
  const handleSave = async (opts: {
    name: string;
    content: string;
    subject?: string;
    language?: string;
    design_json: Record<string, any>;
    variables: Array<{ name: string; example?: string }>;
  }) => {
    if (!appId || !accountId) return;
    setSaving(true);
    try {
      const code = toTemplateCode(opts.name);
      const channelEnum = CHANNEL_TO_API[safeChannel];

      const payload = {
        code,
        channel: channelEnum,
        content: opts.content,
        subject: opts.subject,
        language: opts.language ?? "en",
        visibility: "private" as const,
        design_json: opts.design_json,
        editor_type: "code" as const,
        description: `${safeChannel} template`,
      };

      if (isNew) {
        await createAppTemplateService(appId, payload, accountId);
      } else if (templateId) {
        await updateAppTemplateService(appId, templateId, payload, accountId);
      }

      toast({
        title: "Template saved",
        description: `"${code}" saved successfully.`,
      });
      navigate(backPath);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err instanceof Error ? err.message : "Could not save template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Derive initial values for each editor from design_json
  // ------------------------------------------------------------------
  const dj = designJson ?? {};
  const displayName = existingCode
    ? existingCode
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const initialSms: Partial<SmsEditorValue> = {
    name: displayName,
    body: dj.body ?? "",
    variables: dj.variables ?? [],
  };

  const initialPush: Partial<PushEditorValue> = {
    name: displayName,
    title: dj.title ?? "",
    body: dj.body ?? "",
    iconUrl: dj.iconUrl ?? "",
    imageUrl: dj.imageUrl ?? "",
    actionUrl: dj.actionUrl ?? "",
    variables: dj.variables ?? [],
  };

  const initialInApp: Partial<InAppEditorValue> = {
    name: displayName,
    type: dj.type ?? "toast",
    title: dj.title ?? "",
    body: dj.body ?? "",
    ctaLabel: dj.ctaLabel ?? "",
    ctaUrl: dj.ctaUrl ?? "",
    autoDismiss: dj.autoDismiss ?? true,
    dismissAfter: dj.dismissAfter ?? 5,
    position: dj.position ?? "top-right",
    variables: dj.variables ?? [],
  };

  const initialWhatsApp: Partial<WhatsAppEditorValue> = {
    name: displayName,
    category: dj.category ?? "UTILITY",
    language: dj.language ?? existingLanguage,
    headerType: dj.headerType ?? "none",
    headerText: dj.headerText ?? "",
    headerMediaUrl: dj.headerMediaUrl ?? "",
    body: dj.body ?? "",
    footer: dj.footer ?? "",
    buttons: dj.buttons ?? [],
    variables: dj.variables ?? [],
  };

  const appName = selectedApp?.name ?? "YourApp";

  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">
            Failed to Load
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate(backPath)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const renderEditor = () => {
    switch (safeChannel) {
      case "sms":
        return (
          <SmsEditor
            initialValue={initialSms}
            onSave={async (v: SmsEditorValue) =>
              handleSave({
                name: v.name,
                content: v.body,
                subject: v.name,
                design_json: { body: v.body, variables: v.variables },
                variables: v.variables,
              })
            }
            onCancel={() => navigate(backPath)}
            isSaving={saving}
            appName={appName}
          />
        );
      case "push":
        return (
          <PushEditor
            initialValue={initialPush}
            onSave={async (v: PushEditorValue) =>
              handleSave({
                name: v.name,
                content: v.body, // body → worker uses this
                subject: v.title, // title → subject field
                design_json: {
                  title: v.title,
                  body: v.body,
                  iconUrl: v.iconUrl,
                  imageUrl: v.imageUrl,
                  actionUrl: v.actionUrl,
                  variables: v.variables,
                },
                variables: v.variables,
              })
            }
            onCancel={() => navigate(backPath)}
            isSaving={saving}
            appName={appName}
          />
        );
      case "in-app":
        return (
          <InAppEditor
            initialValue={initialInApp}
            onSave={async (v: InAppEditorValue) =>
              handleSave({
                name: v.name,
                content: v.body,
                subject: v.title,
                design_json: {
                  type: v.type,
                  title: v.title,
                  body: v.body,
                  ctaLabel: v.ctaLabel,
                  ctaUrl: v.ctaUrl,
                  autoDismiss: v.autoDismiss,
                  dismissAfter: v.dismissAfter,
                  position: v.position,
                  variables: v.variables,
                },
                variables: v.variables,
              })
            }
            onCancel={() => navigate(backPath)}
            isSaving={saving}
            appName={appName}
          />
        );
      case "whatsapp":
        return (
          <WhatsAppEditor
            initialValue={initialWhatsApp}
            onSave={async (v: WhatsAppEditorValue) =>
              handleSave({
                name: v.name,
                content: v.body,
                subject: v.name,
                language: v.language,
                design_json: {
                  category: v.category,
                  language: v.language,
                  headerType: v.headerType,
                  headerText: v.headerText,
                  headerMediaUrl: v.headerMediaUrl,
                  body: v.body,
                  footer: v.footer,
                  buttons: v.buttons,
                  variables: v.variables,
                },
                variables: v.variables,
              })
            }
            onCancel={() => navigate(backPath)}
            isSaving={saving}
            appName={appName}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Unknown channel: {safeChannel}
            </p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 flex items-center border-b border-border px-4 gap-4 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                  {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                </div>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.firstName
                    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                    : user.email}
                </span>
              </div>
            )}
          </header>
          <main className="flex-1 overflow-hidden">{renderEditor()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
