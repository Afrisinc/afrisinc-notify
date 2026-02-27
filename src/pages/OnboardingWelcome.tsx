import { Link } from "react-router-dom";
import { ArrowRight, Building2, Mail } from "lucide-react";
import OnboardingLayout from "@/layouts/OnboardingLayout";
import { useState } from "react";

const OnboardingWelcome = () => {
  const [company, setCompany] = useState("Acme Inc.");
  const [senderEmail, setSenderEmail] = useState("");

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Notifyr 🎉</h1>
        <p className="text-muted-foreground">Let's set up your account. This only takes a minute.</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
            <Building2 className="h-4 w-4 text-muted-foreground" /> Company name
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
            <Mail className="h-4 w-4 text-muted-foreground" /> Sender email
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="notifications@acme.com"
          />
          <p className="text-xs text-muted-foreground mt-1.5">This is the "from" address for your notifications.</p>
        </div>
        <Link
          to="/onboarding/getting-started"
          className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingWelcome;
