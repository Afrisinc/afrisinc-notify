import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { UserProvider } from "@/contexts/UserContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getThemeFromCookie } from "@/lib/theme";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AppDashboardLayout from "./layouts/AppDashboardLayout";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import TemplateGallery from "./pages/TemplateGallery";
import TemplatePreview from "./pages/TemplatePreview";
import Signup from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import RegistrationSuccess from "./pages/auth/RegistrationSuccess";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import OnboardingWelcome from "./pages/OnboardingWelcome";
import OnboardingGettingStarted from "./pages/OnboardingGettingStarted";
import NotFound from "./pages/NotFound";

// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import AppsList from "./pages/dashboard/AppsList";
import Marketplace from "./pages/dashboard/Marketplace";
import OrgMembers from "./pages/dashboard/OrgMembers";
import OrgSettings from "./pages/dashboard/OrgSettings";

// App sub-pages
import AppOverview from "./pages/dashboard/app/AppOverview";
import AppNotifications from "./pages/dashboard/app/AppNotifications";
import AppSendNotification from "./pages/dashboard/app/AppSendNotification";
import AppTemplates from "./pages/dashboard/app/AppTemplates";
import AppTemplateEditor from "./pages/dashboard/app/TemplateEditor";
import AppContacts from "./pages/dashboard/app/AppContacts";
import AppCampaigns from "./pages/dashboard/app/AppCampaigns";
import AppApiKeys from "./pages/dashboard/app/AppApiKeys";
import AppLogs from "./pages/dashboard/app/AppLogs";
import AppSettings from "./pages/dashboard/app/AppSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const App = () => {
  useEffect(() => {
    // On app load, check if theme cookie exists and apply it
    const cookieTheme = getThemeFromCookie();
    if (cookieTheme) {
      document.documentElement.classList.toggle("dark", cookieTheme === "dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <UserProvider>
              <ProjectProvider>
                <Routes>
                  {/* ── Public ── */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/templates" element={<TemplateGallery />} />
                    <Route path="/templates/:channel/:slug" element={<TemplatePreview />} />
                  </Route>

                  {/* ── Auth ── */}
                  <Route>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registration-success" element={<RegistrationSuccess />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                  </Route>

                  {/* ── Onboarding (protected — after signup) ── */}
                  <Route
                    path="/onboarding/welcome"
                    element={
                      <ProtectedRoute>
                        <OnboardingWelcome />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding/getting-started"
                    element={
                      <ProtectedRoute>
                        <OnboardingGettingStarted />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Dashboard ── */}
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
                  >
                    <Route index element={<DashboardHome />} />
                    <Route path="apps" element={<AppsList />} />

                    {/* App Dashboard with sub-navigation */}
                    <Route path="apps/:appId" element={<AppDashboardLayout />}>
                      <Route index element={<AppOverview />} />
                      <Route path="notifications" element={<AppNotifications />} />
                      <Route path="notifications/send" element={<AppSendNotification />} />
                      <Route path="templates" element={<AppTemplates />} />
                      <Route path="templates/:id" element={<AppTemplateEditor />} />
                      <Route path="contacts" element={<AppContacts />} />
                      <Route path="campaigns" element={<AppCampaigns />} />
                      <Route path="api-keys" element={<AppApiKeys />} />
                      <Route path="logs" element={<AppLogs />} />
                      <Route path="settings" element={<AppSettings />} />
                    </Route>

                    <Route path="marketplace" element={<Marketplace />} />
                    <Route path="organization/members" element={<OrgMembers />} />
                    <Route path="organization/settings" element={<OrgSettings />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProjectProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
