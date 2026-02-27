import { useState } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const defaultHtml = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #0ea5e9;">Welcome, {{name}}!</h1>
  <p>Thanks for signing up for <strong>{{company}}</strong>.</p>
  <p>Click the button below to get started:</p>
  <a href="{{cta_url}}" style="display: inline-block; background: #0ea5e9; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;">
    Get Started
  </a>
</div>`;

const TemplateEditor = () => {
  const [name, setName] = useState("Welcome Email");
  const [subject, setSubject] = useState("Welcome to {{company}}!");
  const [html, setHtml] = useState(defaultHtml);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to="/app/templates" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-bold bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <Save className="h-4 w-4" /> Save
        </button>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Subject line</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Split editor + preview */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
            HTML Editor
          </div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="flex-1 p-4 bg-background font-mono text-xs resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Live Preview
          </div>
          <div className="flex-1 bg-background p-4 overflow-auto">
            <div
              className="bg-card rounded-lg border border-border p-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
