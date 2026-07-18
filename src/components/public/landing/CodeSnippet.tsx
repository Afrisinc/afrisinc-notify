import { useState } from "react";

type Lang = "node" | "python" | "curl";

type Token = { t: "kw" | "str" | "fn" | "cm" | "pl"; v: string };
type Line = Token[];

const SNIPPETS: Record<Lang, Line[]> = {
  node: [
    [{ t: "cm", v: "// npm install @afrisinc/notify-sdk" }],
    [],
    [
      { t: "kw", v: "import" },
      { t: "pl", v: " { Notify } " },
      { t: "kw", v: "from" },
      { t: "str", v: " '@afrisinc/notify-sdk'" },
      { t: "pl", v: ";" },
    ],
    [],
    [
      { t: "kw", v: "const" },
      { t: "pl", v: " notify = " },
      { t: "kw", v: "new" },
      { t: "pl", v: " Notify({" },
    ],
    [
      { t: "pl", v: "  apiKey: " },
      { t: "str", v: '"nf_live_••••••••••••"' },
    ],
    [{ t: "pl", v: "});" }],
    [],
    [{ t: "cm", v: "// Send across any channel" }],
    [
      { t: "kw", v: "await" },
      { t: "pl", v: " notify." },
      { t: "fn", v: "send" },
      { t: "pl", v: "({" },
    ],
    [
      { t: "pl", v: "  to: " },
      { t: "str", v: '"user@example.com"' },
      { t: "pl", v: "," },
    ],
    [
      { t: "pl", v: "  channel: " },
      { t: "str", v: '"email"' },
      { t: "pl", v: "," },
    ],
    [
      { t: "pl", v: "  template: " },
      { t: "str", v: '"welcome-v2"' },
      { t: "pl", v: "," },
    ],
    [
      { t: "pl", v: "  data: { name: " },
      { t: "str", v: '"Alice"' },
      { t: "pl", v: " }" },
    ],
    [{ t: "pl", v: "});" }],
  ],
  python: [
    [{ t: "cm", v: "# pip install afrisinc-notify-sdk" }],
    [],
    [
      { t: "kw", v: "from" },
      { t: "pl", v: " afrisinc_notify " },
      { t: "kw", v: "import" },
      { t: "pl", v: " Notify" },
    ],
    [],
    [
      { t: "pl", v: "notify = Notify(" },
      { t: "str", v: '"nf_live_••••••••••••"' },
      { t: "pl", v: ")" },
    ],
    [],
    [{ t: "cm", v: "# Send across any channel" }],
    [
      { t: "pl", v: "notify." },
      { t: "fn", v: "send" },
      { t: "pl", v: "(" },
    ],
    [
      { t: "pl", v: "  to=" },
      { t: "str", v: '"user@example.com"' },
      { t: "pl", v: "," },
    ],
    [
      { t: "pl", v: "  channel=" },
      { t: "str", v: '"email"' },
      { t: "pl", v: "," },
    ],
    [
      { t: "pl", v: "  template=" },
      { t: "str", v: '"welcome-v2"' },
    ],
    [{ t: "pl", v: ")" }],
  ],
  curl: [
    [
      { t: "fn", v: "curl" },
      { t: "pl", v: " -X POST \\" },
    ],
    [
      { t: "pl", v: "  https://notify-api.afrisinc.com/api/notify/" },
      { t: "fn", v: "send" },
      { t: "pl", v: " \\" },
    ],
    [
      { t: "pl", v: "  -H " },
      { t: "str", v: '"Authorization: Bearer nf_live_••••"' },
      { t: "pl", v: " \\" },
    ],
    [
      { t: "pl", v: "  -d " },
      { t: "str", v: '\'{"to":"user@example.com",' },
    ],
    [{ t: "str", v: '    "channel":"email",' }],
    [{ t: "str", v: '    "template":"welcome-v2"}\'' }],
  ],
};

const TOKEN_COLORS: Record<string, string> = {
  kw: "#66beee",
  str: "hsl(38,85%,65%)",
  fn: "#36a9ea",
  cm: "hsl(215,15%,45%)",
  pl: "hsl(210,20%,88%)",
};

export function CodeSnippet() {
  const [lang, setLang] = useState<Lang>("node");

  const lines = SNIPPETS[lang];

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/[0.07] shadow-xl"
      style={{
        background: "hsl(224,20%,6%)",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: "hsl(224,18%,7%)" }}
      >
        <div className="flex gap-1.5">
          {["#EC6A5E", "#F4BF4F", "#61C554"].map((c) => (
            <div
              key={c}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex gap-1">
          {(["node", "python", "curl"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all"
              style={{
                background: lang === l ? "rgba(2,147,228,0.15)" : "transparent",
                border: `1px solid ${lang === l ? "rgba(2,147,228,0.3)" : "transparent"}`,
                color: lang === l ? "#36a9ea" : "hsl(215,15%,50%)",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Code body */}
      <div className="px-5 py-4 text-[13px] leading-[1.85] overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className="flex" style={{ minHeight: "1.85em" }}>
            <span
              className="select-none text-right shrink-0 mr-5 text-[11px]"
              style={{ color: "hsl(215,15%,28%)", minWidth: 14 }}
            >
              {i + 1}
            </span>
            <span className="whitespace-nowrap">
              {line.map((tok, j) => (
                <span key={j} style={{ color: TOKEN_COLORS[tok.t] }}>
                  {tok.v}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* Response footer */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[0.06]"
        style={{ background: "hsl(224,18%,7%)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span
          className="text-[12px] font-medium"
          style={{
            color: "hsl(152,60%,45%)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          200 OK — message queued
        </span>
        <span
          className="ml-auto text-[11px]"
          style={{ color: "hsl(215,15%,45%)" }}
        >
          ~38ms
        </span>
      </div>
    </div>
  );
}
