import { Link } from "react-router-dom";
import { ArrowRight, FileText, Key, Send, Check } from "lucide-react";
import OnboardingLayout from "@/layouts/OnboardingLayout";

const steps = [
  { icon: FileText, title: "Create a template", description: "Design your first email or notification template.", done: false },
  { icon: Key, title: "Generate an API key", description: "Get your credentials for sending via API.", done: false },
  { icon: Send, title: "Send a test notification", description: "Verify everything works end-to-end.", done: false },
];

const OnboardingGettingStarted = () => {
  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Getting started</h1>
        <p className="text-muted-foreground">Complete these steps to start sending notifications.</p>
      </div>
      <div className="space-y-4 mb-8">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
              step.done ? "bg-success/10" : "bg-muted"
            }`}>
              {step.done ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <step.icon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {i + 1}/3
            </span>
          </div>
        ))}
      </div>
      <Link
        to="/dashboard"
        className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    </OnboardingLayout>
  );
};

export default OnboardingGettingStarted;
