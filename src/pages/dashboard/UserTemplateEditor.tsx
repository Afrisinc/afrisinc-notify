/**
 * UserTemplateEditor
 * Routes: /dashboard/templates/:id          → email editor
 *         /dashboard/templates/:channel/:id  → sms | push | in-app | whatsapp
 *
 * API contract (same as ChannelEditorPage):
 *  - code       → UPPER_SNAKE_CASE (^[A-Z_]+$)
 *  - content    → plain body string used by workers
 *  - subject    → notification title for Push / In-App
 *  - design_json → full editor state for round-trip editing
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { EmailEditor } from "@/components/EmailEditor/EmailEditor";
import theme from "@/components/EmailEditor/core/theme";
import { SmsEditor, type SmsEditorValue } from "@/components/editors/SmsEditor";
import { PushEditor, type PushEditorValue } from "@/components/editors/PushEditor";
import { InAppEditor, type InAppEditorValue } from "@/components/editors/InAppEditor";
import { WhatsAppEditor, type WhatsAppEditorValue } from "@/components/editors/WhatsAppEditor";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccountId } from "@/hooks/useAuth";
import { createTemplateService, updateTemplateService } from "@/services/templatesService";
import { Loader2 } from "lucide-react";
import getApiClient from "@/services/apiClient";

type ChannelParam = "sms" | "push" | "in-app" | "whatsapp";

/** Transform user-input name → backend UPPER_SNAKE_CASE code (^[A-Z_]+$) */
function toTemplateCode(name: string): string {
  const code = name
    .trim()
    .toUpperCase()
    .replace(/[\s\-./]+/g, "_")
    .replace(/[^A-Z_]/g, "")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  return code || "TEMPLATE";
}

const CHANNEL_TO_ENUM: Record<ChannelParam, string> = {
  sms: "SMS",
  push: "PUSH",
  "in-app": "IN_APP",
  whatsapp: "WHATSAPP",
};

async function fetchUserTemplate(templateId: string, accountId: string) {
  const client = getApiClient();
  const res = await client.get(`/api/templates/${templateId}`, {
    headers: { "x-account-id": accountId },
  });
  return res.data?.data || res.data;
}

export default function UserTemplateEditor() {
  const { id: templateId, channel } = useParams<{ id: string; channel?: ChannelParam }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const accountId = useCurrentAccountId();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [designJson, setDesignJson] = useState<Record<string, any> | null>(null);
  const [existingCode, setExistingCode] = useState<string>("");
  const [existingLanguage, setExistingLanguage] = useState<string>("en");

  const isNew = templateId === "new";
  const safeChannel = (channel ?? "email") as ChannelParam | "email";
  const backPath = "/dashboard/templates";

  useEffect(() => {
    if (isNew || !templateId || !accountId || safeChannel === "email") return;

    const load = async () => {
      try {
        setLoading(true);
        const tpl = await fetchUserTemplate(templateId, accountId);
        const dj = tpl.design_json;
        if (dj && typeof dj === "object" && Object.keys(dj).length > 0) {
          setDesignJson(dj);
        } else if (typeof tpl.content === "string" && tpl.content.trim().startsWith("{")) {
          try { setDesignJson(JSON.parse(tpl.content)); } catch { setDesignJson({ body: tpl.content }); }
        } else {
          setDesignJson({ body: tpl.content ?? "" });
        }
        setExistingCode(tpl.code ?? "");
        setExistingLanguage(tpl.language ?? "en");
      } catch {
        // template not found — proceed as new
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [templateId, accountId, isNew, safeChannel]);

  if (!templateId) return <div className="p-8 text-muted-foreground">Invalid template</div>;

  if (safeChannel === "email") {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EmailEditor templateId={templateId} onCancel={() => navigate(backPath)} />
      </ThemeProvider>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async (opts: {
    name: string;
    content: string;
    subject?: string;
    language?: string;
    design_json: Record<string, any>;
    variables: Array<{ name: string; example?: string }>;
  }) => {
    if (!accountId) return;
    setSaving(true);
    try {
      const code = toTemplateCode(opts.name);
      const channelEnum = CHANNEL_TO_ENUM[safeChannel as ChannelParam] as any;

      const base = {
        code,
        channel: channelEnum,
        content: opts.content,
        subject: opts.subject,
        language: opts.language ?? "en",
        description: `${safeChannel} template`,
        visibility: "private" as const,
        design_json: opts.design_json,
        editor_type: "code",
        accountId,
      };

      if (isNew) {
        await createTemplateService(base);
      } else {
        await updateTemplateService(templateId, base);
      }

      toast({ title: "Template saved", description: `"${code}" saved successfully.` });
      navigate(backPath);
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const dj = designJson ?? {};
  const displayName = existingCode
    ? existingCode.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  switch (safeChannel) {
    case "sms":
      return (
        <SmsEditor
          initialValue={{ name: displayName, body: dj.body ?? "", variables: dj.variables ?? [] }}
          onSave={async (v: SmsEditorValue) =>
            handleSave({
              name: v.name, content: v.body, subject: v.name,
              design_json: { body: v.body, variables: v.variables },
              variables: v.variables,
            })
          }
          onCancel={() => navigate(backPath)}
          isSaving={saving}
        />
      );
    case "push":
      return (
        <PushEditor
          initialValue={{ name: displayName, title: dj.title ?? "", body: dj.body ?? "", iconUrl: dj.iconUrl ?? "", imageUrl: dj.imageUrl ?? "", actionUrl: dj.actionUrl ?? "", variables: dj.variables ?? [] }}
          onSave={async (v: PushEditorValue) =>
            handleSave({
              name: v.name, content: v.body, subject: v.title,
              design_json: { title: v.title, body: v.body, iconUrl: v.iconUrl, imageUrl: v.imageUrl, actionUrl: v.actionUrl, variables: v.variables },
              variables: v.variables,
            })
          }
          onCancel={() => navigate(backPath)}
          isSaving={saving}
        />
      );
    case "in-app":
      return (
        <InAppEditor
          initialValue={{ name: displayName, type: dj.type ?? "toast", title: dj.title ?? "", body: dj.body ?? "", ctaLabel: dj.ctaLabel ?? "", ctaUrl: dj.ctaUrl ?? "", autoDismiss: dj.autoDismiss ?? true, dismissAfter: dj.dismissAfter ?? 5, position: dj.position ?? "top-right", variables: dj.variables ?? [] }}
          onSave={async (v: InAppEditorValue) =>
            handleSave({
              name: v.name, content: v.body, subject: v.title,
              design_json: { type: v.type, title: v.title, body: v.body, ctaLabel: v.ctaLabel, ctaUrl: v.ctaUrl, autoDismiss: v.autoDismiss, dismissAfter: v.dismissAfter, position: v.position, variables: v.variables },
              variables: v.variables,
            })
          }
          onCancel={() => navigate(backPath)}
          isSaving={saving}
        />
      );
    case "whatsapp":
      return (
        <WhatsAppEditor
          initialValue={{ name: displayName, category: dj.category ?? "UTILITY", language: dj.language ?? existingLanguage, headerType: dj.headerType ?? "none", headerText: dj.headerText ?? "", headerMediaUrl: dj.headerMediaUrl ?? "", body: dj.body ?? "", footer: dj.footer ?? "", buttons: dj.buttons ?? [], variables: dj.variables ?? [] }}
          onSave={async (v: WhatsAppEditorValue) =>
            handleSave({
              name: v.name, content: v.body, subject: v.name, language: v.language,
              design_json: { category: v.category, language: v.language, headerType: v.headerType, headerText: v.headerText, headerMediaUrl: v.headerMediaUrl, body: v.body, footer: v.footer, buttons: v.buttons, variables: v.variables },
              variables: v.variables,
            })
          }
          onCancel={() => navigate(backPath)}
          isSaving={saving}
        />
      );
    default:
      return <div className="p-8 text-muted-foreground">Unknown channel: {safeChannel}</div>;
  }
}
