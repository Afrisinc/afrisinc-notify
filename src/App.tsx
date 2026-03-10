import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getThemeFromCookie } from "@/lib/theme";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import TemplateGallery from "./pages/TemplateGallery";
import TemplatePreview from "./pages/TemplatePreview";
import Signup from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
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

              {/* ── Authenticated App ── */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
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
            </ProjectProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
