import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocSection {
  id: string;
  title: string;
  content: string;
}

interface DocsSearchProps {
  sections: DocSection[];
  onNavigate: (id: string) => void;
}

export function DocsSearch({ sections, onNavigate }: DocsSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results =
    query.length > 1
      ? sections
          .filter(
            (s) =>
              s.title.toLowerCase().includes(query.toLowerCase()) ||
              s.content.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  const handleSelect = useCallback(
    (id: string) => {
      onNavigate(id);
      setOpen(false);
      setQuery("");
    },
    [onNavigate],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex].id);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-foreground/70 dark:text-foreground/80 border border-border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors w-full md:w-auto"
      >
        <Search className="h-4 w-4" />
        <span>Search docs...</span>
        <kbd className="hidden md:inline-flex ml-auto text-xs border border-border rounded px-1.5 py-0.5 text-foreground/70 dark:text-foreground/80">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg">
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-foreground/70 dark:text-foreground/80 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search documentation..."
              className="flex-1 bg-transparent border-0 py-3 px-3 text-sm text-foreground placeholder:text-foreground/70 dark:text-foreground/80 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-foreground/70 dark:text-foreground/80 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {query.length > 1 && (
            <div className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="text-sm text-foreground/70 dark:text-foreground/80 text-center py-6">
                  No results found
                </p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors ${
                      i === selectedIndex
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className="font-medium">{r.title}</span>
                    <p className="text-xs text-foreground/70 dark:text-foreground/80 mt-0.5 truncate">
                      {r.content.substring(0, 80)}...
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
