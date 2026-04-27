import React, { useRef } from "react";
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
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import {
  VariableInserter,
  insertVariableAtCursor,
  type TemplateVariable,
} from "./VariableInserter";
import { cn } from "@/lib/utils";

// GSM-7 character set
const GSM7_CHARS =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1BÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ`¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = "^{}\\[~]|€";

function isGSM7(text: string): boolean {
  for (const ch of text) {
    if (!GSM7_CHARS.includes(ch) && !GSM7_EXTENDED.includes(ch)) return false;
  }
  return true;
}

function getSmsStats(body: string | undefined) {
  const bodyStr = body ?? "";
  const unicode = !isGSM7(bodyStr);
  const len = bodyStr.length;
  const singleLimit = unicode ? 70 : 160;
  const multiLimit = unicode ? 67 : 153;
  const segments =
    len === 0 ? 0 : len <= singleLimit ? 1 : Math.ceil(len / multiLimit);
  const charsLeft =
    segments <= 1 ? singleLimit - len : multiLimit * segments - len;
  return { unicode, len, segments, charsLeft, singleLimit };
}

/** Preview the API code that will be derived from the name */
function toTemplateCodePreview(name: string): string {
  const code = name
    .trim()
    .toUpperCase()
    .replace(/[\s\-./]+/g, "_")
    .replace(/[^A-Z_]/g, "")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
  return code || "";
}

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  body: z
    .string()
    .min(1, "Message body is required")
    .max(1600, "Too long (max 1600 chars)"),
});

type FormData = z.infer<typeof schema>;

export interface SmsEditorValue {
  name: string;
  body: string;
  variables: TemplateVariable[];
}

interface SmsEditorProps {
  initialValue?: Partial<SmsEditorValue>;
  onSave: (value: SmsEditorValue) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  appName?: string;
}

export function SmsEditor({
  initialValue,
  onSave,
  onCancel,
  isSaving,
  appName = "YourApp",
}: SmsEditorProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValue?.name ?? "",
      body: initialValue?.body ?? "",
    },
  });

  const [variables, setVariables] = React.useState<TemplateVariable[]>(
    initialValue?.variables ?? [],
  );

  const nameValue = form.watch("name");
  const codePreview = toTemplateCodePreview(nameValue);
  const bodyValue = form.watch("body");
  const stats = getSmsStats(bodyValue);

  const previewBody = variables.reduce((text, v) => {
    return text.replace(
      new RegExp(`\\{\\{${v.name}\\}\\}`, "g"),
      v.example || `[${v.name}]`,
    );
  }, bodyValue);

  const handleInsertVariable = (name: string) => {
    const current = form.getValues("body");
    insertVariableAtCursor(bodyRef as any, name, current, (val) =>
      form.setValue("body", val, { shouldDirty: true }),
    );
    if (!variables.some((v) => v.name === name)) {
      setVariables((prev) => [...prev, { name }]);
    }
  };

  const handleSubmit = async (data: FormData) => {
    await onSave({ name: data.name, body: data.body, variables });
  };

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

          <div className="flex items-center gap-2 flex-1 min-w-0">
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
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 shrink-0"
            >
              <MessageSquare className="h-3 w-3 mr-1" /> SMS
            </Badge>
          </div>

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

        {/* Body */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 max-w-6xl mx-auto">
            {/* Left: Editor */}
            <div className="lg:col-span-3 space-y-5">
              {/* Message card */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Message
                    </CardTitle>
                    <VariableInserter
                      variables={variables}
                      onInsert={handleInsertVariable}
                      onVariablesChange={setVariables}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                            placeholder="Type your SMS message here... Use {{variable_name}} for dynamic content."
                            className="min-h-[160px] resize-none text-sm font-mono leading-relaxed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stats bar */}
                  <div
                    className={cn(
                      "flex items-center justify-between text-[11px] px-3 py-2 rounded-lg border",
                      stats.unicode
                        ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                        : "bg-muted/50 border-border",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {stats.unicode && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle className="h-3 w-3" /> Unicode
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Encoding:{" "}
                        <span className="font-semibold text-foreground">
                          {stats.unicode ? "Unicode" : "GSM-7"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>
                        <span
                          className={cn(
                            "font-semibold",
                            stats.charsLeft < 0
                              ? "text-destructive"
                              : "text-foreground",
                          )}
                        >
                          {stats.len}
                        </span>
                        <span>
                          /{stats.singleLimit * (stats.segments || 1)} chars
                        </span>
                      </span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>
                        <span className="font-semibold text-foreground">
                          {stats.segments}
                        </span>{" "}
                        segment{stats.segments !== 1 && "s"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variables card */}
              <Card className="rounded-xl border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Variables
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Define dynamic values used in your message.
                  </p>
                </CardHeader>
                <CardContent>
                  {variables.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                      No variables. Click "Insert Variable" above to add one.
                    </p>
                  ) : (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                              Variable
                            </th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                              Example value
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Phone preview */}
            <div className="lg:col-span-2 flex flex-col items-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Preview
              </p>
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[280px] h-[520px] bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col">
                  {/* Status bar */}
                  <div className="h-8 bg-slate-900 flex items-center justify-between px-5 shrink-0">
                    <span className="text-white text-[10px] font-semibold">
                      9:41
                    </span>
                    <div className="w-16 h-4 bg-slate-900 rounded-full absolute left-1/2 -translate-x-1/2 top-0" />
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5 items-end">
                        <div className="w-0.5 h-1 bg-white/70 rounded-sm" />
                        <div className="w-0.5 h-1.5 bg-white/70 rounded-sm" />
                        <div className="w-0.5 h-2 bg-white/70 rounded-sm" />
                        <div className="w-0.5 h-2.5 bg-white/70 rounded-sm" />
                      </div>
                      <div className="w-3.5 h-1.5 rounded-sm border border-white/50 ml-1">
                        <div className="w-2 h-full bg-white/70 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* SMS app header */}
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {appName[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-[11px] font-semibold">
                          {appName}
                        </p>
                        <p className="text-slate-400 text-[9px]">SMS</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 bg-slate-100 dark:bg-slate-200 px-3 py-4 overflow-hidden flex flex-col justify-end gap-2">
                    {previewBody ? (
                      <div className="flex gap-2 items-end">
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[8px] font-bold">
                            {appName[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 max-w-[200px] shadow-sm">
                          <p className="text-slate-900 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                            {previewBody}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px] text-center py-8">
                        Your message will appear here
                      </p>
                    )}
                  </div>

                  {/* Input bar */}
                  <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center gap-2 shrink-0">
                    <div className="flex-1 bg-slate-100 rounded-full px-3 py-1">
                      <span className="text-slate-400 text-[10px]">
                        Message
                      </span>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="text-white text-[8px]">▲</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
