import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import OnboardingGettingStarted from "./pages/OnboardingGettingStarted";
import Dashboard from "./pages/Dashboard";
import TemplatesList from "./pages/TemplatesList";
import TemplateEditor from "./pages/TemplateEditor";
import NotificationsList from "./pages/NotificationsList";
import SendNotification from "./pages/SendNotification";
import ApiKeys from "./pages/ApiKeys";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Docs />} />
          </Route>

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Onboarding */}
          <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
          <Route path="/onboarding/getting-started" element={<OnboardingGettingStarted />} />

          {/* Authenticated App */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="templates" element={<TemplatesList />} />
            <Route path="templates/:id" element={<TemplateEditor />} />
            <Route path="send" element={<SendNotification />} />
            <Route path="notifications" element={<NotificationsList />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
