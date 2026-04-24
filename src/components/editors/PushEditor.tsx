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
import {
  ArrowLeft,
  Save,
  Loader2,
  Bell,
  Smartphone,
  Monitor,
} from "lucide-react";
import {
  VariableInserter,
  insertVariableAtCursor,
  type TemplateVariable,
} from "./VariableInserter";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(1, "Title is required").max(65, "Max 65 characters"),
  body: z.string().min(1, "Body is required").max(240, "Max 240 characters"),
  iconUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  actionUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export interface PushEditorValue {
  name: string;
  title: string;
  body: string;
  iconUrl?: string;
  imageUrl?: string;
  actionUrl?: string;
  variables: TemplateVariable[];
}

interface PushEditorProps {
  initialValue?: Partial<PushEditorValue>;
  onSave: (value: PushEditorValue) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  appName?: string;
}

type PreviewDevice = "android" | "ios";

export function PushEditor({
  initialValue,
  onSave,
  onCancel,
  isSaving,
  appName = "YourApp",
}: PushEditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>(
    initialValue?.variables ?? [],
  );
  const [activeField, setActiveField] = useState<"title" | "body">("body");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("android");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValue?.name ?? "",
      title: initialValue?.title ?? "",
      body: initialValue?.body ?? "",
      iconUrl: initialValue?.iconUrl ?? "",
      imageUrl: initialValue?.imageUrl ?? "",
      actionUrl: initialValue?.actionUrl ?? "",
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
  const titleValue = form.watch("title");
  const bodyValue = form.watch("body");
  const imageUrl = form.watch("imageUrl");
  const iconUrl = form.watch("iconUrl");

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
      title: data.title,
      body: data.body,
      iconUrl: data.iconUrl || undefined,
      imageUrl: data.imageUrl || undefined,
      actionUrl: data.actionUrl || undefined,
      variables,
    });
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
            className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] px-2 shrink-0"
          >
            <Bell className="h-3 w-3 mr-1" /> Push
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
              {/* Content card */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Notification Content
                    </CardTitle>
                    <VariableInserter
                      variables={variables}
                      onInsert={handleInsertVariable}
                      onVariablesChange={setVariables}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active field:{" "}
                    <span className="font-medium text-foreground capitalize">
                      {activeField}
                    </span>
                  </p>
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
                            ({(titleValue || "").length}/65)
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
                            maxLength={65}
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
                            ({(bodyValue || "").length}/240)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            ref={(el) => {
                              (field as any).ref(el);
                              (bodyRef as any).current = el;
                            }}
                            placeholder="Notification body text..."
                            className="min-h-[100px] resize-none text-sm"
                            maxLength={240}
                            onFocus={() => setActiveField("body")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Media card */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Media & Actions{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Icon URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://yourapp.com/icon.png"
                            className="text-sm font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Image URL{" "}
                          <span className="text-muted-foreground font-normal">
                            (banner image)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://yourapp.com/banner.jpg"
                            className="text-sm font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="actionUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Action URL{" "}
                          <span className="text-muted-foreground font-normal">
                            (on click)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://yourapp.com/page"
                            className="text-sm font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Variables card */}
              {variables.length > 0 && (
                <Card className="rounded-xl border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                              Variable
                            </th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                              Example
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {variables.map((v, i) => (
                            <tr
                              key={v.name}
                              className={cn(
                                "border-b border-border last:border-0",
                                i % 2 === 1 && "bg-muted/20",
                              )}
                            >
                              <td className="px-3 py-2">
                                <code className="font-mono text-primary font-semibold">{`{{${v.name}}}`}</code>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {v.example || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-2 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Preview
                </p>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("android")}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-medium flex items-center gap-1 transition-colors",
                      previewDevice === "android"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Smartphone className="h-3 w-3" /> Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("ios")}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-medium flex items-center gap-1 transition-colors border-l border-border",
                      previewDevice === "ios"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Monitor className="h-3 w-3" /> iOS
                  </button>
                </div>
              </div>

              {previewDevice === "android" ? (
                /* Android notification */
                <div className="w-[300px] space-y-2">
                  <div className="bg-slate-800 rounded-2xl p-1.5">
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-3 shadow-sm">
                      <div className="flex items-start gap-2">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt="icon"
                            className="h-8 w-8 rounded-md object-cover shrink-0"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
                            <Bell className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              {appName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {timeStr}
                            </span>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 mt-0.5 leading-tight">
                            {previewTitle || (
                              <span className="text-slate-400 font-normal">
                                Notification title
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                            {previewBody || (
                              <span className="text-slate-400">
                                Notification body message...
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="preview"
                            className="w-full h-24 object-cover"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Android notification shade
                  </p>
                </div>
              ) : (
                /* iOS notification */
                <div className="w-[300px] space-y-2">
                  <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl p-4 pb-6">
                    <div className="text-center text-white mb-3">
                      <p className="text-2xl font-thin">{timeStr}</p>
                      <p className="text-xs opacity-80">Today</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                      <div className="flex items-start gap-2">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt="icon"
                            className="h-10 w-10 rounded-xl object-cover shrink-0"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                            <Bell className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wide">
                              {appName}
                            </span>
                            <span className="text-[10px] text-white/60">
                              {timeStr}
                            </span>
                          </div>
                          <p className="text-[13px] font-semibold text-white mt-0.5 leading-tight">
                            {previewTitle || (
                              <span className="font-normal opacity-60">
                                Notification title
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-white/80 mt-0.5 leading-relaxed line-clamp-2">
                            {previewBody || (
                              <span className="opacity-60">
                                Notification body...
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    iOS lock screen
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
