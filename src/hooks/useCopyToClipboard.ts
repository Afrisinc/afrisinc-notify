import { useState } from "react";

export function useCopyToClipboard(resetMs = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy to clipboard:", err);
    });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), resetMs);
  };

  const isCopied = (id: string) => copiedId === id;

  return { copy, isCopied };
}
