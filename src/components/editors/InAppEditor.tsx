import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Save,
  Loader2,
  Monitor,
  X,
  ExternalLink,
} from "lucide-react";
import {
  VariableInserter,
  insertVariableAtCursor,
  type TemplateVariable,
} from "./VariableInserter";
import { cn } from "@/lib/utils";

type NotificationType = "toast" | "banner" | "modal";
type ToastPosition =
  | "top-right"
  | "top-center"
  | "bottom-right"
  | "bottom-center";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["toast", "banner", "modal"]),
  title: z.string().min(1, "Title is required").max(80, "Max 80 characters"),
  body: z.string().min(1, "Body is required").max(400, "Max 400 characters"),
  ctaLabel: z.string().max(40).optional().or(z.literal("")),
  ctaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  autoDismiss: z.boolean(),
  dismissAfter: z.number().min(1).max(60),
  position: z.enum([
    "top-right",
    "top-center",
    "bottom-right",
    "bottom-center",
  ]),
});

type FormData = z.infer<typeof schema>;

export interface InAppEditorValue {
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  autoDismiss: boolean;
  dismissAfter: number;
  position: ToastPosition;
  variables: TemplateVariable[];
}

interface InAppEditorProps {
  initialValue?: Partial<InAppEditorValue>;
  onSave: (value: InAppEditorValue) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  appName?: string;
}

function InAppPreview({
  type,
  title,
  body,
  ctaLabel,
  autoDismiss,
  dismissAfter,
  position,
}: {
  type: NotificationType;
  title: string;
  body: string;
  ctaLabel?: string;
  autoDismiss: boolean;
  dismissAfter: number;
  position: ToastPosition;
}) {
  const displayTitle = title || "Notification title";
  const displayBody = body || "Your notification message will appear here.";

  if (type === "modal") {
    return (
      <div className="w-full h-[340px] bg-slate-100 dark:bg-slate-900 rounded-xl relative overflow-hidden border border-border flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[220px] p-5 z-10">
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight pr-4">
            {displayTitle}
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {displayBody}
          </p>
          {ctaLabel && (
            <button className="mt-4 w-full bg-primary text-primary-foreground text-[11px] font-semibold rounded-lg py-1.5">
              {ctaLabel}
            </button>
          )}
          <button className="mt-2 w-full text-[11px] text-slate-400 hover:text-slate-600">
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (type === "banner") {
    return (
      <div className="w-full h-[340px] bg-slate-100 dark:bg-slate-900 rounded-xl relative overflow-hidden border border-border">
        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground px-4 py-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold leading-tight">
              {displayTitle}
            </p>
            <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed line-clamp-2">
              {displayBody}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {ctaLabel && (
              <button className="text-[10px] font-semibold bg-white/20 rounded px-2 py-1 whitespace-nowrap">
                {ctaLabel}
              </button>
            )}
            <X className="h-3.5 w-3.5 opacity-70" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-16 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">App content area</p>
        </div>
      </div>
    );
  }

  // Toast
  const positionClasses: Record<ToastPosition, string> = {
    "top-right": "top-3 right-3",
    "top-center": "top-3 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-3 right-3",
    "bottom-center": "bottom-3 left-1/2 -translate-x-1/2",
  };

  return (
    <div className="w-full h-[340px] bg-slate-100 dark:bg-slate-900 rounded-xl relative overflow-hidden border border-border">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">App content area</p>
      </div>
      <div className={cn("absolute z-10 w-[200px]", positionClasses[position])}>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {displayTitle}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                {displayBody}
              </p>
              {ctaLabel && (
                <button className="mt-2 text-[10px] font-semibold text-primary flex items-center gap-1">
                  {ctaLabel} <ExternalLink className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
            <X className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
          </div>
          {autoDismiss && (
            <div className="mt-2 h-0.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary/50 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InAppEditor({
  initialValue,
  onSave,
  onCancel,
  isSaving,
}: InAppEditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>(
    initialValue?.variables ?? [],
  );
  const [activeField, setActiveField] = useState<"title" | "body">("body");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValue?.name ?? "",
      type: initialValue?.type ?? "toast",
      title: initialValue?.title ?? "",
      body: initialValue?.body ?? "",
      ctaLabel: initialValue?.ctaLabel ?? "",
      ctaUrl: initialValue?.ctaUrl ?? "",
      autoDismiss: initialValue?.autoDismiss ?? true,
      dismissAfter: initialValue?.dismissAfter ?? 5,
      position: initialValue?.position ?? "top-right",
    },
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
  const typeValue = form.watch("type");
  const titleValue = form.watch("title");
  const bodyValue = form.watch("body");
  const ctaLabel = form.watch("ctaLabel");
  const autoDismiss = form.watch("autoDismiss");
  const dismissAfter = form.watch("dismissAfter");
  const position = form.watch("position");

  const previewTitle = variables.reduce(
    (t, v) =>
      t.replace(
        new RegExp(`\\{\\{${v.name}\\}\\}`, "g"),
        v.example || `[${v.name}]`,
      ),
    titleValue,
  );
  const previewBody = variables.reduce(
    (t, v) =>
      t.replace(
        new RegExp(`\\{\\{${v.name}\\}\\}`, "g"),
        v.example || `[${v.name}]`,
      ),
    bodyValue,
  );

  const handleInsertVariable = (varName: string) => {
    if (activeField === "title") {
      const current = form.getValues("title");
      insertVariableAtCursor(titleRef as any, varName, current, (val) =>
        form.setValue("title", val, { shouldDirty: true }),
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
      type: data.type,
      title: data.title,
      body: data.body,
      ctaLabel: data.ctaLabel || undefined,
      ctaUrl: data.ctaUrl || undefined,
      autoDismiss: data.autoDismiss,
      dismissAfter: data.dismissAfter,
      position: data.position,
      variables,
    });
  };

  const typeOptions: {
    value: NotificationType;
    label: string;
    description: string;
  }[] = [
    {
      value: "toast",
      label: "Toast",
      description: "Small non-blocking notification",
    },
    {
      value: "banner",
      label: "Banner",
      description: "Full-width top-of-page notification",
    },
    {
      value: "modal",
      label: "Modal",
      description: "Centered overlay requiring action",
    },
  ];

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
            className="bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400 border border-violet-200 dark:border-violet-800 text-[10px] px-2 shrink-0 capitalize"
          >
            <Monitor className="h-3 w-3 mr-1" /> In-App · {typeValue}
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
            <div className="lg:col-span-3 space-y-5">
              {/* Type selector */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Notification Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-3 gap-2">
                          {typeOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                "rounded-lg border p-3 text-left transition-all",
                                field.value === opt.value
                                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                                  : "border-border bg-card hover:bg-muted/50",
                              )}
                            >
                              <p className="text-xs font-semibold text-foreground">
                                {opt.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                {opt.description}
                              </p>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Content card */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Content
                    </CardTitle>
                    <VariableInserter
                      variables={variables}
                      onInsert={handleInsertVariable}
                      onVariablesChange={setVariables}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Title{" "}
                          <span className="text-muted-foreground font-normal">
                            ({(titleValue || "").length}/80)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            ref={(el) => {
                              (field as any).ref(el);
                              (titleRef as any).current = el;
                            }}
                            placeholder="Notification title..."
                            className="text-sm"
                            maxLength={80}
                            onFocus={() => setActiveField("title")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Body{" "}
                          <span className="text-muted-foreground font-normal">
                            ({(bodyValue || "").length}/400)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            ref={(el) => {
                              (field as any).ref(el);
                              (bodyRef as any).current = el;
                            }}
                            placeholder="Notification message..."
                            className="min-h-[90px] resize-none text-sm"
                            maxLength={400}
                            onFocus={() => setActiveField("body")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* CTA + behavior */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Action Button{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="ctaLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Button label
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="View details"
                              className="text-sm"
                              maxLength={40}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ctaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Button URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://..."
                              className="text-sm font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Behavior */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typeValue === "toast" && (
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Position
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
                              <SelectItem value="top-right">
                                Top Right
                              </SelectItem>
                              <SelectItem value="top-center">
                                Top Center
                              </SelectItem>
                              <SelectItem value="bottom-right">
                                Bottom Right
                              </SelectItem>
                              <SelectItem value="bottom-center">
                                Bottom Center
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="autoDismiss"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <div>
                            <FormLabel className="text-xs font-medium">
                              Auto dismiss
                            </FormLabel>
                            <p className="text-[11px] text-muted-foreground">
                              Automatically hide after duration
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  {autoDismiss && (
                    <FormField
                      control={form.control}
                      name="dismissAfter"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel className="text-xs font-medium">
                              Dismiss after
                            </FormLabel>
                            <span className="text-xs font-semibold text-foreground">
                              {field.value}s
                            </span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={60}
                              step={1}
                              value={[field.value]}
                              onValueChange={([v]) => field.onChange(v)}
                              className="w-full"
                            />
                          </FormControl>
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span>1s</span>
                            <span>60s</span>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-2 flex flex-col items-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Preview
              </p>
              <div className="w-full max-w-sm">
                <InAppPreview
                  type={typeValue}
                  title={previewTitle}
                  body={previewBody}
                  ctaLabel={ctaLabel}
                  autoDismiss={autoDismiss}
                  dismissAfter={dismissAfter}
                  position={position}
                />
              </div>
              {variables.length > 0 && (
                <div className="w-full max-w-sm mt-5">
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
