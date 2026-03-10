import { Mail, MessageSquare, Bell, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/templates";
import { useAuth } from "@/contexts/AuthContext";

interface TemplateCardProps {
  template: Template;
}

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
  "in-app": Smartphone,
};

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

export function TemplateCard({ template }: TemplateCardProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const Icon = channelIcons[template.channel];

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
      navigate(`/app/templates/${template.slug}`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <h3 className="heading-label">{template.name}</h3>
            <p className="text-xs text-secondary mt-0.5">
              {channelLabels[template.channel]}
            </p>
          </div>
        </div>
        {template.isFree && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            Free
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-body text-sm mb-4 flex-1">{template.description}</p>

      {/* Category & Author */}
      <div className="flex items-center justify-between text-xs text-secondary mb-4">
        <span className="capitalize">{categoryLabels[template.category]}</span>
        <span>by {template.author}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border/50">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/templates/${template.channel}/${template.id}`}>
            Preview
          </Link>
        </Button>
        <Button
          variant="primary-solid"
          size="sm"
          className="flex-1"
          onClick={handleUseTemplate}
          disabled={loading}
        >
          {loading ? "Loading..." : "Use Template"}
        </Button>
      </div>
    </div>
  );
}
