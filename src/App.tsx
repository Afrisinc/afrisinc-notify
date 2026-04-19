import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { AppProvider } from "@/contexts/AppContext";
import { UserProvider } from "@/contexts/UserContext";
import { OrgProvider } from "@/contexts/OrgContext";
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
import InviteAccept from "./pages/InviteAccept";
import NotFound from "./pages/NotFound";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import DPA from "./pages/legal/DPA";


// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import AppsList from "./pages/dashboard/AppsList";
import MyTemplates from "./pages/dashboard/MyTemplates";
import UserTemplateEditor from "./pages/dashboard/UserTemplateEditor";
import Marketplace from "./pages/dashboard/Marketplace";
import OrgMembers from "./pages/dashboard/OrgMembers";
import OrgSettings from "./pages/dashboard/OrgSettings";
import Billing from "./pages/dashboard/Billing";

// App sub-pages
import AppOverview from "./pages/dashboard/app/AppOverview";
import AppNotifications from "./pages/dashboard/app/AppNotifications";
import AppSendNotification from "./pages/dashboard/app/AppSendNotification";
import AppTemplates from "./pages/dashboard/app/AppTemplates";
import AppContacts from "./pages/dashboard/app/AppContacts";
import AppCampaigns from "./pages/dashboard/app/AppCampaigns";
import AppCampaignAnalytics from "./pages/dashboard/app/AppCampaignAnalytics";
import AppApiKeys from "./pages/dashboard/app/AppApiKeys";
import AppLogs from "./pages/dashboard/app/AppLogs";
import AppSettings from "./pages/dashboard/app/AppSettings";

// Email Editor
import EditorPage from "./pages/editor/[id]";
import EditorPageLegacy from "./pages/editor/legacy";

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

  // Global OAuth callback handler - processes any OAuth provider redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const referrer = sessionStorage.getItem('oauth_referrer');

    console.log('OAuth redirect check:', { code: !!code, state: !!state, referrer, pathname: window.location.pathname });

    // If we have OAuth params and a saved referrer, redirect to referrer with params
    if (code && state && referrer && !window.location.pathname.includes('settings')) {
      console.log('Redirecting to referrer with OAuth params:', referrer);
      // Redirect to the referrer page (AppSettings) with OAuth params intact
      // so the GmailSection component can process them
      const redirectUrl = `${referrer}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      window.location.href = redirectUrl;
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
              <OrgProvider>
                <ProjectProvider>
                  <AppProvider>
                    <Routes>
                  {/* ── Public ── */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/templates" element={<TemplateGallery />} />
                    <Route path="/templates/:channel/:slug" element={<TemplatePreview />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/dpa" element={<DPA />} />
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

                  {/* ── Invite Acceptance (public — no auth required) ── */}
                  <Route path="/invite/:inviteId/:token" element={<InviteAccept />} />

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

                  {/* ── Email Editor (dedicated route) ── */}
                  <Route
                    path="/editor/:appId/:templateId"
                    element={
                      <ProtectedRoute>
                        <EditorPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Legacy route support - redirect old format to new */}
                  <Route
                    path="/editor/:templateId"
                    element={
                      <ProtectedRoute>
                        <EditorPageLegacy />
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
                    <Route path="templates" element={<MyTemplates />} />
                    <Route path="templates/:id" element={<UserTemplateEditor />} />

                    {/* App Dashboard with sub-navigation */}
                    <Route path="apps/:appId" element={<AppDashboardLayout />}>
                      <Route index element={<AppOverview />} />
                      <Route path="notifications" element={<AppNotifications />} />
                      <Route path="notifications/send" element={<AppSendNotification />} />
                      <Route path="templates" element={<AppTemplates />} />
                      <Route path="contacts" element={<AppContacts />} />
                      <Route path="campaigns" element={<AppCampaigns />} />
                      <Route path="campaigns/:campaignId/analytics" element={<AppCampaignAnalytics />} />
                      <Route path="api-keys" element={<AppApiKeys />} />
                      <Route path="logs" element={<AppLogs />} />
                      <Route path="settings" element={<AppSettings />} />
                    </Route>

                    <Route path="marketplace" element={<Marketplace />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="organization/members" element={<OrgMembers />} />
                    <Route path="organization/settings" element={<OrgSettings />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppProvider>
                </ProjectProvider>
              </OrgProvider>
            </UserProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
