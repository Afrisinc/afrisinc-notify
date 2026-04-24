import { useState } from "react";
import { Printer } from "lucide-react";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  const scrollTo = (id: string) => {
    setActiveId(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="py-16 bg-gradient-hero relative">
      <BackgroundDecorator />
      <div className="container max-w-4xl relative z-10">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="heading-section">{title}</h1>
            <p className="text-sm text-foreground/70 dark:text-foreground/80 mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden md:flex"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        <div className="flex gap-10">
          {/* Desktop TOC */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-20 self-start">
            <p className="text-xs font-semibold text-foreground/70 dark:text-foreground/80 uppercase tracking-wider mb-3">
              Contents
            </p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className={`text-left text-sm w-full px-2 py-1 rounded transition-colors ${
                      activeId === s.id
                        ? "text-primary font-medium bg-primary/5"
                        : "text-foreground/70 dark:text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  {s.title}
                </h2>
                <p className="text-foreground/70 dark:text-foreground/80 leading-relaxed">
                  {s.content}
                </p>
              </section>
            ))}

            <div className="border-t border-border pt-8 mt-12">
              <p className="text-sm text-foreground/70 dark:text-foreground/80">
                For questions about this document, contact us at{" "}
                <a
                  href="mailto:legal@afrisinc.com"
                  className="text-primary hover:underline"
                >
                  legal@afrisinc.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
