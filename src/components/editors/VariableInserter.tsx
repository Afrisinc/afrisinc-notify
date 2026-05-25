import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Braces, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TemplateVariable {
  name: string;
  example?: string;
}

interface VariableInserterProps {
  variables: TemplateVariable[];
  onInsert: (variableName: string) => void;
  onVariablesChange: (variables: TemplateVariable[]) => void;
  className?: string;
}

export function VariableInserter({
  variables,
  onInsert,
  onVariablesChange,
  className,
}: VariableInserterProps) {
  const [open, setOpen] = useState(false);
  const [newVarName, setNewVarName] = useState("");
  const [newVarExample, setNewVarExample] = useState("");

  const handleInsert = (name: string) => {
    onInsert(name);
    setOpen(false);
  };

  const handleAddVariable = () => {
    const name = newVarName.trim().replace(/\s+/g, "_").toLowerCase();
    if (!name) return;
    if (variables.some((v) => v.name === name)) return;

    onVariablesChange([
      ...variables,
      { name, example: newVarExample.trim() || undefined },
    ]);
    setNewVarName("");
    setNewVarExample("");
  };

  const handleRemoveVariable = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onVariablesChange(variables.filter((v) => v.name !== name));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5 text-xs h-7 font-medium", className)}
        >
          <Braces className="h-3.5 w-3.5" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0 rounded-xl"
        sideOffset={4}
      >
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground">Variables</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click to insert{" "}
            <code className="font-mono bg-muted px-1 rounded">
              {"{{variable}}"}
            </code>
          </p>
        </div>

        <div className="p-2 max-h-48 overflow-y-auto">
          {variables.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No variables yet. Add one below.
            </p>
          ) : (
            <div className="space-y-1">
              {variables.map((v) => (
                <div
                  key={v.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleInsert(v.name)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsert(v.name)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-left group cursor-pointer"
                >
                  <div className="min-w-0">
                    <code className="text-xs font-mono text-primary font-semibold">{`{{${v.name}}}`}</code>
                    {v.example && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        e.g. {v.example}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveVariable(v.name, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Add new variable
          </p>
          <div className="flex gap-1.5">
            <Input
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder="variable_name"
              className="h-7 text-xs font-mono flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
            />
            <Input
              value={newVarExample}
              onChange={(e) => setNewVarExample(e.target.value)}
              placeholder="example"
              className="h-7 text-xs flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs gap-1"
            onClick={handleAddVariable}
            disabled={!newVarName.trim()}
          >
            <Plus className="h-3 w-3" /> Add Variable
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Inserts `{{name}}` at cursor position in a textarea ref.
 * Returns updated value string.
 */
export function insertVariableAtCursor(
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement>,
  variableName: string,
  currentValue: string,
  onChange: (value: string) => void,
) {
  const el = ref.current;
  if (!el) {
    onChange(currentValue + `{{${variableName}}}`);
    return;
  }
  const start = el.selectionStart ?? currentValue.length;
  const end = el.selectionEnd ?? currentValue.length;
  const tag = `{{${variableName}}}`;
  const next = currentValue.slice(0, start) + tag + currentValue.slice(end);
  onChange(next);

  // restore cursor after the inserted tag
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + tag.length, start + tag.length);
  });
}

/** Extract {{variable}} names from a string */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.slice(2, -2).trim()))];
}
