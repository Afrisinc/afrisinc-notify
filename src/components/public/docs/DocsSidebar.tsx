import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  id: string;
  title: string;
  children?: NavItem[];
}

interface DocsSidebarProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

function NavList({
  items,
  activeId,
  onNavigate,
  depth = 0,
}: DocsSidebarProps & { depth?: number }) {
  return (
    <ul
      className={
        depth > 0 ? "ml-3 border-l border-border pl-3 space-y-1" : "space-y-1"
      }
    >
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => onNavigate(item.id)}
            className={`block w-full text-left text-sm rounded-md px-3 py-1.5 transition-colors ${
              activeId === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/70 dark:text-foreground/80 hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {item.title}
          </button>
          {item.children && (
            <NavList
              items={item.children}
              activeId={activeId}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export function DocsSidebar({ items, activeId, onNavigate }: DocsSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-60 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
        <p className="text-xs font-semibold text-foreground/70 dark:text-foreground/80 uppercase tracking-wider mb-3 px-3">
          Documentation
        </p>
        <NavList items={items} activeId={activeId} onNavigate={onNavigate} />
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden mb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" /> Docs Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pt-10">
            <p className="text-xs font-semibold text-foreground/70 dark:text-foreground/80 uppercase tracking-wider mb-3 px-3">
              Documentation
            </p>
            <NavList items={items} activeId={activeId} onNavigate={handleNav} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
