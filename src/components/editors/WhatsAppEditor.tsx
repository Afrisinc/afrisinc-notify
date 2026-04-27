import React, { useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  MessageCircle,
  Plus,
  X,
  ExternalLink,
  CornerDownLeft,
  CheckCheck,
  Clock,
} from "lucide-react";
import {
  VariableInserter,
  insertVariableAtCursor,
  type TemplateVariable,
} from "./VariableInserter";
import { cn } from "@/lib/utils";

type WaCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
type WaHeaderType = "none" | "text" | "image" | "video" | "document";
type WaButtonType = "QUICK_REPLY" | "URL" | "PHONE";

const buttonSchema = z.object({
  type: z.enum(["QUICK_REPLY", "URL", "PHONE"]),
  text: z.string().min(1, "Required").max(25, "Max 25 chars"),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(512),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().min(2),
  headerType: z.enum(["none", "text", "image", "video", "document"]),
  headerText: z.string().max(60).optional().or(z.literal("")),
  headerMediaUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  body: z.string().min(1, "Body is required").max(1024, "Max 1024 characters"),
  footer: z.string().max(60).optional().or(z.literal("")),
  buttons: z.array(buttonSchema).max(3),
});

type FormData = z.infer<typeof schema>;

export interface WhatsAppEditorValue {
  name: string;
  category: WaCategory;
  language: string;
  headerType: WaHeaderType;
  headerText?: string;
  headerMediaUrl?: string;
  body: string;
  footer?: string;
  buttons: Array<{
    type: WaButtonType;
    text: string;
    url?: string;
    phone?: string;
  }>;
  variables: TemplateVariable[];
}

interface WhatsAppEditorProps {
  initialValue?: Partial<WhatsAppEditorValue>;
  onSave: (value: WhatsAppEditorValue) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  appName?: string;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "en_US", label: "English (US)" },
  { value: "en_GB", label: "English (UK)" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
  { value: "pt_BR", label: "Portuguese (Brazil)" },
  { value: "sw", label: "Swahili" },
  { value: "am", label: "Amharic" },
  { value: "yo", label: "Yoruba" },
  { value: "ha", label: "Hausa" },
  { value: "ig", label: "Igbo" },
];

const CATEGORY_LABELS: Record<
  WaCategory,
  { label: string; color: string; description: string }
> = {
  MARKETING: {
    label: "Marketing",
    color: "text-pink-600 dark:text-pink-400",
    description: "Promotions & offers",
  },
  UTILITY: {
    label: "Utility",
    color: "text-blue-600 dark:text-blue-400",
    description: "Transactional updates",
  },
  AUTHENTICATION: {
    label: "Authentication",
    color: "text-emerald-600 dark:text-emerald-400",
    description: "OTPs & verification",
  },
};

function WaPreview({
  headerType,
  headerText,
  headerMediaUrl,
  body,
  footer,
  buttons,
  variables,
  appName,
}: {
  headerType: WaHeaderType;
  headerText?: string;
  headerMediaUrl?: string;
  body: string;
  footer?: string;
  buttons: FormData["buttons"];
  variables: TemplateVariable[];
  appName: string;
}) {
  const resolve = (text: string) =>
    variables.reduce(
      (t, v) =>
        t.replace(
          new RegExp(`\\{\\{${v.name}\\}\\}`, "g"),
          v.example || `[${v.name}]`,
        ),
      text,
    );

  return (
    <div className="w-[280px]">
      {/* Phone wrapper */}
      <div className="bg-[#ECE5DD] rounded-2xl overflow-hidden shadow-xl border border-slate-300/50">
        {/* WA header bar */}
        <div className="bg-[#075E54] flex items-center gap-2 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-[#128C7E] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">
              {appName[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[12px] font-semibold leading-tight truncate">
              {appName}
            </p>
            <p className="text-green-200 text-[10px]">Business Account</p>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <CheckCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Chat area */}
        <div className="p-3 min-h-[200px] space-y-1">
          <div className="bg-white rounded-xl rounded-tl-sm shadow-sm max-w-[240px] overflow-hidden">
            {/* Header */}
            {headerType === "text" && headerText && (
              <div className="px-3 pt-3 pb-1">
                <p className="text-[13px] font-bold text-[#111B21] leading-tight">
                  {resolve(headerText)}
                </p>
              </div>
            )}
            {(headerType === "image" || headerType === "video") && (
              <div className="h-28 bg-slate-200 flex items-center justify-center">
                {headerMediaUrl ? (
                  <img
                    src={headerMediaUrl}
                    alt="header"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {headerType === "video" ? "📹 Video" : "🖼 Image"}
                  </p>
                )}
              </div>
            )}
            {headerType === "document" && (
              <div className="px-3 pt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                  <span className="text-[10px]">📄</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {headerMediaUrl ? "Document" : "Document attachment"}
                </p>
              </div>
            )}

            {/* Body */}
            <div className="px-3 py-2">
              <p className="text-[12px] text-[#111B21] leading-relaxed whitespace-pre-wrap break-words">
                {body ? (
                  resolve(body)
                ) : (
                  <span className="text-slate-400">Your message body...</span>
                )}
              </p>
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-3 pb-2">
                <p className="text-[10px] text-[#667781]">{resolve(footer)}</p>
              </div>
            )}

            {/* Timestamp */}
            <div className="px-3 pb-2 flex justify-end">
              <span className="text-[9px] text-[#667781] flex items-center gap-1">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <CheckCheck className="h-2.5 w-2.5 text-[#53BDEB]" />
              </span>
            </div>

            {/* Buttons */}
            {buttons.length > 0 && (
              <div className="border-t border-[#E9EDEF]">
                {buttons.map((btn, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 text-[#00A884] text-[12px] font-medium",
                      i > 0 && "border-t border-[#E9EDEF]",
                    )}
                  >
                    {btn.type === "URL" && <ExternalLink className="h-3 w-3" />}
                    {btn.type === "QUICK_REPLY" && (
                      <CornerDownLeft className="h-3 w-3" />
                    )}
                    <span>{btn.text || "Button"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppEditor({
  initialValue,
  onSave,
  onCancel,
  isSaving,
  appName = "YourApp",
}: WhatsAppEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>(
    initialValue?.variables ?? [],
  );
  const [activeField, setActiveField] = useState<"body" | "header">("body");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValue?.name ?? "",
      category: initialValue?.category ?? "UTILITY",
      language: initialValue?.language ?? "en",
      headerType: initialValue?.headerType ?? "none",
      headerText: initialValue?.headerText ?? "",
      headerMediaUrl: initialValue?.headerMediaUrl ?? "",
      body: initialValue?.body ?? "",
      footer: initialValue?.footer ?? "",
      buttons: initialValue?.buttons ?? [],
    },
  });

  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control: form.control,
    name: "buttons",
  });

  const nameValue = form.watch("name");
  const codePreview = nameValue
    ? nameValue
        .trim()
        .toUpperCase()
        .replace(/[\s\-./]+/g, "_")
        .replace(/[^A-Z_]/g, "")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_")
    : "";
  const headerType = form.watch("headerType");
  const bodyValue = form.watch("body");
  const buttons = form.watch("buttons");
  const footerValue = form.watch("footer");
  const headerText = form.watch("headerText");
  const headerMediaUrl = form.watch("headerMediaUrl");
  const category = form.watch("category");

  const handleInsertVariable = (varName: string) => {
    if (activeField === "header") {
      const current = form.getValues("headerText") || "";
      insertVariableAtCursor(headerRef as any, varName, current, (val) =>
        form.setValue("headerText", val, { shouldDirty: true }),
      );
    } else {
      const current = form.getValues("body");
      insertVariableAtCursor(bodyRef as any, varName, current, (val) =>
        form.setValue("body", val, { shouldDirty: true }),
      );
    }
    if (!variables.some((v) => v.name === varName)) {
      setVariables((prev) => [...prev, { name: varName }]);
    }
  };

  const handleSubmit = async (data: FormData) => {
    await onSave({
      name: data.name,
      category: data.category,
      language: data.language,
      headerType: data.headerType,
      headerText: data.headerText || undefined,
      headerMediaUrl: data.headerMediaUrl || undefined,
      body: data.body,
      footer: data.footer || undefined,
      buttons: data.buttons as WhatsAppEditorValue["buttons"],
      variables,
    });
  };

  const catInfo = CATEGORY_LABELS[category];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1 max-w-xs space-y-0">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Template name..."
                    className="h-8 text-sm font-medium bg-transparent border-transparent hover:border-input focus:border-input transition-colors"
                  />
                </FormControl>
                {codePreview && (
                  <p className="text-[10px] text-muted-foreground px-1 mt-0.5">
                    Code:{" "}
                    <code className="font-mono text-primary">
                      {codePreview}
                    </code>
                  </p>
                )}
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-200 dark:border-green-800 text-[10px] px-2 shrink-0"
          >
            <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
          </Badge>

          <div className="flex-1" />

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="gap-2 h-8 px-4 rounded-lg"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 max-w-6xl mx-auto">
            {/* Left: Editor */}
            <div className="lg:col-span-3 space-y-5">
              {/* Meta info */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Template Info
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Required by WhatsApp Business API for approval.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Category
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            Object.entries(CATEGORY_LABELS) as [
                              WaCategory,
                              (typeof CATEGORY_LABELS)[WaCategory],
                            ][]
                          ).map(([key, info]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => field.onChange(key)}
                              className={cn(
                                "rounded-lg border p-2.5 text-left transition-all",
                                field.value === key
                                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                                  : "border-border bg-card hover:bg-muted/50",
                              )}
                            >
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  field.value === key
                                    ? info.color
                                    : "text-foreground",
                                )}
                              >
                                {info.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {info.description}
                              </p>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Language
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map((l) => (
                              <SelectItem key={l.value} value={l.value}>
                                {l.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Header */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Header{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="headerType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            [
                              "none",
                              "text",
                              "image",
                              "video",
                              "document",
                            ] as WaHeaderType[]
                          ).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => field.onChange(t)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                                field.value === t
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-card text-muted-foreground hover:bg-muted",
                              )}
                            >
                              {t === "none"
                                ? "None"
                                : t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  {headerType === "text" && (
                    <FormField
                      control={form.control}
                      name="headerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Header text{" "}
                            <span className="text-muted-foreground font-normal">
                              ({(headerText || "").length}/60)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              ref={(el) => {
                                (field as any).ref(el);
                                (headerRef as any).current = el;
                              }}
                              placeholder="Header text..."
                              className="text-sm"
                              maxLength={60}
                              onFocus={() => setActiveField("header")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {(headerType === "image" ||
                    headerType === "video" ||
                    headerType === "document") && (
                    <FormField
                      control={form.control}
                      name="headerMediaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            {headerType.charAt(0).toUpperCase() +
                              headerType.slice(1)}{" "}
                            URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`https://example.com/file.${headerType === "image" ? "jpg" : headerType === "video" ? "mp4" : "pdf"}`}
                              className="text-sm font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Body */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Body{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        ({(bodyValue || "").length}/1024)
                      </span>
                    </CardTitle>
                    <VariableInserter
                      variables={variables}
                      onInsert={handleInsertVariable}
                      onVariablesChange={setVariables}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use{" "}
                    <code className="font-mono bg-muted px-1 rounded text-[11px]">
                      {"{{variable}}"}
                    </code>{" "}
                    for dynamic content.
                  </p>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            ref={(el) => {
                              (field as any).ref(el);
                              (bodyRef as any).current = el;
                            }}
                            placeholder="Hello {{name}}, your order {{order_id}} has been confirmed..."
                            className="min-h-[120px] resize-none text-sm font-mono"
                            maxLength={1024}
                            onFocus={() => setActiveField("body")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Footer */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Footer{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional · {(footerValue || "").length}/60)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="footer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Reply STOP to unsubscribe"
                            className="text-sm"
                            maxLength={60}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Buttons */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        Buttons{" "}
                        <span className="text-muted-foreground font-normal text-xs">
                          (optional · max 3)
                        </span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Quick replies or links for recipients to act on.
                      </p>
                    </div>
                    {buttonFields.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() =>
                          appendButton({
                            type: "QUICK_REPLY",
                            text: "",
                            url: "",
                            phone: "",
                          })
                        }
                      >
                        <Plus className="h-3 w-3" /> Add Button
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {buttonFields.length > 0 && (
                  <CardContent className="space-y-3">
                    {buttonFields.map((f, idx) => {
                      const btnType = form.watch(`buttons.${idx}.type`);
                      return (
                        <div
                          key={f.id}
                          className="rounded-lg border border-border p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <FormField
                              control={form.control}
                              name={`buttons.${idx}.type`}
                              render={({ field }) => (
                                <div className="flex gap-1">
                                  {(
                                    [
                                      "QUICK_REPLY",
                                      "URL",
                                      "PHONE",
                                    ] as WaButtonType[]
                                  ).map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => field.onChange(t)}
                                      className={cn(
                                        "px-2 py-1 rounded text-[10px] font-medium border transition-all",
                                        field.value === t
                                          ? "border-primary bg-primary/10 text-primary"
                                          : "border-border bg-muted/30 text-muted-foreground",
                                      )}
                                    >
                                      {t === "QUICK_REPLY"
                                        ? "Quick Reply"
                                        : t === "URL"
                                          ? "URL"
                                          : "Phone"}
                                    </button>
                                  ))}
                                </div>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeButton(idx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div
                            className={cn(
                              "grid gap-2",
                              btnType !== "QUICK_REPLY"
                                ? "grid-cols-2"
                                : "grid-cols-1",
                            )}
                          >
                            <FormField
                              control={form.control}
                              name={`buttons.${idx}.text`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Button text"
                                      className="text-xs h-7"
                                      maxLength={25}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-[10px]" />
                                </FormItem>
                              )}
                            />
                            {btnType === "URL" && (
                              <FormField
                                control={form.control}
                                name={`buttons.${idx}.url`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="https://example.com"
                                        className="text-xs h-7 font-mono"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                  </FormItem>
                                )}
                              />
                            )}
                            {btnType === "PHONE" && (
                              <FormField
                                control={form.control}
                                name={`buttons.${idx}.phone`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="+1234567890"
                                        className="text-xs h-7 font-mono"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-2 flex flex-col items-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Preview
              </p>
              <WaPreview
                headerType={headerType}
                headerText={headerText}
                headerMediaUrl={headerMediaUrl}
                body={bodyValue}
                footer={footerValue}
                buttons={buttons}
                variables={variables}
                appName={appName}
              />
              {variables.length > 0 && (
                <div className="w-[280px] mt-5">
                  <Card className="rounded-xl border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-foreground">
                        Variables
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {variables.map((v) => (
                          <div
                            key={v.name}
                            className="flex items-center justify-between text-xs"
                          >
                            <code className="font-mono text-primary font-semibold">{`{{${v.name}}}`}</code>
                            <span className="text-muted-foreground">
                              {v.example || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
