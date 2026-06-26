import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { resetDocument } from "../../../documents/editor/EditorContext";

import validateJsonStringValue from "./validateJsonStringValue";

type ImportJsonDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function ImportJsonDialog({
  open,
  onClose,
}: ImportJsonDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (ev) => {
    const v = ev.currentTarget.value;
    setValue(v);
    const { error } = validateJsonStringValue(v);
    setError(error ?? null);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const { error, data } = validateJsonStringValue(value);
    setError(error ?? null);
    if (!data) {
      return;
    }
    resetDocument(data);
    handleClose();
  };

  const handleClose = () => {
    setValue("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-content dark:text-white">
            Import JSON
          </DialogTitle>
          <DialogDescription className="text-sm text-content-secondary dark:text-foreground/70">
            Copy and paste an EmailBuilder.js JSON template to import it. This
            will override your current template.{" "}
            <a
              href="https://gist.githubusercontent.com/jordanisip/efb61f56ba71bd36d3a9440122cb7f50/raw/30ea74a6ac7e52ebdc309bce07b71a9286ce2526/emailBuilderTemplate.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View example
            </a>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest">
              JSON Template
            </label>
            <textarea
              value={value}
              onChange={handleChange}
              placeholder="Paste your EmailBuilder.js JSON here..."
              rows={10}
              className="w-full rounded-xl border border-border/40 dark:border-border/50 bg-card dark:bg-slate-800 text-content dark:text-white placeholder:text-content-secondary dark:placeholder:text-foreground/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={error !== null || !value.trim()}>
              Import
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
