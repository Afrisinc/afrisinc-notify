import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Check, ChevronRight } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTemplate, useUserProjects } from "@/hooks/useTemplates";
import { installTemplate } from "@/services/templatesService";
import { useAuth } from "@/contexts/AuthContext";

const defaultHtml = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 28px; margin: 0 0 16px 0; font-weight: bold;">Welcome, {{name}}!</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Thanks for signing up for <strong>{{company}}</strong>.</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">Click the button below to get started:</p>
  <a href="{{cta_url}}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 12px; font-weight: 500;">
    Get Started
  </a>
  <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">If you have any questions, please don't hesitate to reach out!</p>
</div>`;

const TemplateEditor = () => {
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("Welcome Email");
  const [subject, setSubject] = useState("Welcome to {{company}}!");
  const [html, setHtml] = useState(defaultHtml);

  // Install flow states
  const [showInstall, setShowInstall] = useState(false);
  const [installStep, setInstallStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState("");
  const [installError, setInstallError] = useState<string | null>(null);

  // Fetch template data if slug is provided
  const { data: template } = useTemplate(slug);

  // Fetch user projects only when authenticated
  const { data: projectsData } = useUserProjects({ enabled: !authLoading && !!user });
  const projects = projectsData || [];

  // Load template data when available
  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject || "");
      if (template.content?.email?.html) {
        setHtml(template.content.email.html);
      }
    }
  }, [template]);

  const handleInstall = async () => {
    if (!selectedProject || !slug || !template) return;

    try {
      setInstallError(null);
      setInstallStep(2);

      // Prepare content based on channel
      const content: any = {};
      if (template.channel === 'email') {
        content.email = {
          subject: subject,
          html: html,
        };
      } else if (template.channel === 'sms') {
        content.sms = {
          body: html,
        };
      } else if (template.channel === 'push') {
        content.push = {
          title: subject || name,
          body: html,
        };
      } else if (template.channel === 'in-app') {
        content['in-app'] = {
          title: subject || name,
          body: html,
        };
      }

      // Call the install template API
      await installTemplate({
        slug,
        projectId: selectedProject,
        name,
        channel: template.channel,
        subject: template.channel === 'email' ? subject : undefined,
        content,
        language: template.language || 'en',
        description: template.description,
      });

      // Show success state
      setTimeout(() => {
        setInstallStep(3);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to install template";
      setInstallError(errorMessage);
      setInstallStep(1);
    }
  };

  const handleCloseInstall = () => {
    setShowInstall(false);
    setInstallStep(1);
    setSelectedProject("");
    setInstallError(null);
  };

  const handleSave = () => {
    console.log("Saving template:", { name, subject, html });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Install Modal Dialog */}
      <Dialog open={showInstall} onOpenChange={setShowInstall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Template</DialogTitle>
            <DialogDescription>
              Add "{name}" to your project.
            </DialogDescription>
          </DialogHeader>

          {/* Steps Progress */}
          <div className="flex items-center gap-2 py-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    installStep >= step
                      ? "bg-primary-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {installStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* Step 1: Select Project */}
          {installStep === 1 && (
            <div className="space-y-4">
              {installError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {installError}
                </div>
              )}
              {projects.length === 0 ? (
                <div className="p-3 rounded-lg bg-warning/10 text-secondary text-sm">
                  <p className="font-medium mb-2">No projects available</p>
                  <p className="text-xs">You need to create a project first before installing templates.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Select Project</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                className="w-full bg-primary-500 hover:bg-primary-400 text-white"
                disabled={!selectedProject || projects.length === 0}
                onClick={handleInstall}
              >
                Install Template
              </Button>
            </div>
          )}

          {/* Step 2: Installing */}
          {installStep === 2 && (
            <div className="text-center py-6">
              <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              <p className="text-sm text-secondary">Installing template...</p>
            </div>
          )}

          {/* Step 3: Success */}
          {installStep === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-success/10">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">Template Installed!</p>
                <p className="text-xs text-secondary mt-1">
                  You can now customize it for your project.
                </p>
              </div>
              <Button
                className="w-full bg-primary-500 hover:bg-primary-400 text-white"
                onClick={handleCloseInstall}
              >
                Start Editing
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor */}
      <div className="h-[calc(100vh-5rem)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-6 pt-6">
          <div className="flex items-center gap-3">
            <Link
              to="/templates"
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
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
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              onClick={() => setShowInstall(true)}
              className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
            >
              <Check className="h-4 w-4" /> Install
            </button>
          </div>
        </div>

        {/* Subject */}
        <div className="px-6 mb-4">
          <label className="block text-xs font-medium text-secondary mb-1">Subject line</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Split editor + preview */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 px-6 pb-6">
          <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-secondary">
              HTML Editor
            </div>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="flex-1 p-4 bg-card font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-secondary flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Live Preview
            </div>
            <div className="flex-1 bg-card p-4 overflow-auto">
              <div
                className="bg-white dark:bg-slate-950 rounded-lg border border-border p-4"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
