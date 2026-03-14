import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useTemplate, useTemplateById } from "@/hooks/useTemplates";
import { SkeletonCard } from "@/components/SkeletonCard";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";

export default function TemplatePreview() {
  const { channel, slug, id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showCodeCopied, setShowCodeCopied] = useState(false);

  // Support both slug and ID-based routing
  const { data: template, isLoading, error } = id
    ? useTemplateById(id)
    : useTemplate(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-section mb-4">
            {error ? "Failed to load template" : "Template not found"}
          </h1>
          <p className="text-secondary mb-6">
            {error ? "Please try again or go back to the gallery." : "The template you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <a href="/templates">Back to Gallery</a>
          </Button>
        </div>
      </div>
    );
  }

  const channelLabels = {
    email: "Email",
    sms: "SMS",
    push: "Push",
    "in-app": "In-App",
  };

  const categoryLabels: Record<string, string> = {
    authentication: "Authentication",
    transactional: "Transactional",
    marketing: "Marketing",
    alerts: "Alerts",
  };

  const handleCopyCode = () => {
    const dataFields = template.variables
      .map((v: any) => {
        const example = v.example || `<${v.name}>`;
        return `"${v.name}": "${example}"`;
      })
      .join(",\n    ");

    const code = `POST /notifications/send
{
  "template": "${template.slug}",
  "to": "${template.channel === "email" ? "user@example.com" : "+1555123456"}",
  "data": {
    ${dataFields}
  }
}`;
    navigator.clipboard.writeText(code);
    setShowCodeCopied(true);
    setTimeout(() => setShowCodeCopied(false), 2000);
  };

  const handleUseTemplate = () => {
    // Don't redirect while authentication is still loading
    if (loading) {
      return;
    }

    if (!user) {
      // Redirect to signup with template info
      window.location.href = `/signup?template=${template.slug}`;
    } else {
      // Navigate to template editor with install modal
      navigate(`/dashboard/templates/${template.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorator />
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 py-4">
          <button
            onClick={() => navigate("/templates")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
          </button>
          <h1 className="heading-section">{template.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-4 gap-4 mb-12"
          >
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-secondary mb-1">Channel</p>
              <p className="heading-label">{channelLabels[template.channel]}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-secondary mb-1">Category</p>
              <p className="heading-label">{categoryLabels[template.category]}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-secondary mb-1">Author</p>
              <p className="heading-label">{template.author}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-secondary mb-1">Price</p>
              <p className="heading-label text-success">{template.isFree ? "Free" : "Paid"}</p>
            </div>
          </motion.div>

          {/* Preview Section */}
          {template.channel === "email" && template.content?.email && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-12"
            >
              <h2 className="heading-section mb-6">Email Preview</h2>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {template.subject && (
                  <div className="bg-muted/30 border-b border-border px-6 py-4">
                    <p className="text-xs text-secondary mb-1">Subject:</p>
                    <p className="font-mono text-sm">{template.subject}</p>
                  </div>
                )}
                <div className="p-6 bg-white dark:bg-slate-950">
                  {template.content.email.html ? (
                    <div
                      className="max-w-xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: template.content.email.html }}
                    />
                  ) : (
                    <p className="text-muted-foreground">{template.content.email.body || "No content"}</p>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {template.channel === "sms" && template.content.sms && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-12"
            >
              <h2 className="heading-section mb-6">SMS Preview</h2>
              <div className="bg-card border border-border rounded-lg p-6 max-w-md">
                <div className="bg-primary-500 text-white rounded-lg p-4">
                  <p className="text-sm">{template.content.sms.body}</p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="heading-section mb-6">Template Variables</h2>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium px-6 py-4 text-secondary">Variable</th>
                      {template.variables.some((v) => v.type) && (
                        <th className="text-left font-medium px-6 py-4 text-secondary">Type</th>
                      )}
                      {template.variables.some((v) => v.example) && (
                        <th className="text-left font-medium px-6 py-4 text-secondary">Example</th>
                      )}
                      <th className="text-left font-medium px-6 py-4 text-secondary">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.variables.map((variable) => (
                      <tr key={variable.name} className="border-b border-border/50 last:border-0">
                        <td className="px-6 py-4 font-mono text-primary-500">{`{{${variable.name}}}`}</td>
                        {template.variables.some((v) => v.type) && (
                          <td className="px-6 py-4 text-secondary">{variable.type || "string"}</td>
                        )}
                        {template.variables.some((v) => v.example) && (
                          <td className="px-6 py-4 font-mono text-xs">{variable.example || "-"}</td>
                        )}
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              variable.required
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-secondary"
                            }`}
                          >
                            {variable.required ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}

          {/* Code Example */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="heading-section mb-6">API Usage</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/30 border-b border-border px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-secondary flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  POST /notifications/send
                </p>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-400 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {showCodeCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto font-mono text-xs bg-slate-950 dark:bg-slate-900 text-slate-100">
                {`{
  "template": "${template.slug}",
  "to": "${template.channel === "email" ? "user@example.com" : "+1555123456"}",
  "data": {
    ${template.variables
      .map((v: any) => {
        const example = v.example || `<${v.name}>`;
        return `"${v.name}": "${example}"`;
      })
      .join(",\n    ")}
  }
}`}
              </pre>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <Button asChild variant="secondary-outline" size="md">
              <a href="/templates">Back to Gallery</a>
            </Button>
            <Button
              onClick={handleUseTemplate}
              variant="primary-solid"
              size="md"
              disabled={loading}
            >
              {loading ? "Loading..." : "Use This Template"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
