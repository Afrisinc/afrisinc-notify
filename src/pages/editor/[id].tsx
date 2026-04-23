/**
 * Email Editor Page - Dedicated Route
 * Route: /editor/:appId/:templateId
 * Loads and edits email templates using the visual EmailBuilder
 * Works standalone without requiring app context
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmailEditor from '@/components/EmailEditor/EmailEditor';
import { useAppContext } from '@/contexts/AppContext';
import { useOrg } from '@/contexts/OrgContext';
import { getAppService } from '@/services/apps';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const EditorPage = () => {
  const { appId, templateId } = useParams<{ appId: string; templateId: string }>();
  const navigate = useNavigate();
  const { selectedApp, setSelectedApp } = useAppContext();
  const { currentOrg, allOrgs, setCurrentOrg } = useOrg();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch app if not in context
  useEffect(() => {
    if (!appId) {
      setError('Missing appId');
      setLoading(false);
      return;
    }

    // If templateId is "new", skip fetching and just set up the app
    if (templateId === 'new') {
      const setupForNewTemplate = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch app to get organization_id
          const app = await getAppService(appId);
          setSelectedApp(app);

          // Set organization if available
          if (app.organization_id && allOrgs.length > 0 && !currentOrg) {
            const appOrg = allOrgs.find(org => org.id === app.organization_id);
            if (appOrg) {
              setCurrentOrg(appOrg);
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load app';
          setError(message);
          console.error('Error loading app:', err);
        } finally {
          setLoading(false);
        }
      };

      if (!selectedApp || selectedApp.id !== appId) {
        setupForNewTemplate();
      } else {
        setLoading(false);
      }
      return;
    }

    // For existing templates, fetch the template
    if (!templateId) {
      setError('Missing templateId');
      setLoading(false);
      return;
    }

    const fetchApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch app to get organization_id
        const app = await getAppService(appId);
        setSelectedApp(app);

        // Set organization if available
        if (app.organization_id && allOrgs.length > 0 && !currentOrg) {
          const appOrg = allOrgs.find(org => org.id === app.organization_id);
          if (appOrg) {
            setCurrentOrg(appOrg);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load app';
        setError(message);
        console.error('Error loading app:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!selectedApp || selectedApp.id !== appId) {
      fetchApp();
    } else {
      setLoading(false);
    }
  }, [appId, templateId, selectedApp, allOrgs, currentOrg, setSelectedApp, setCurrentOrg]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedApp) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Failed to Load</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error || 'Could not load app'}
          </p>
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            Back to Apps
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-dashboard backdrop-blur-sm sticky top-0 z-40">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                  {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                </div>
                <span className="text-sm text-content-secondary hidden sm:block">
                  {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.email}
                </span>
              </div>
            )}
          </header>
          <main className="flex-1 overflow-hidden bg-background">
            <EmailEditor
              appId={selectedApp.id}
              templateId={templateId}
              onCancel={() => navigate(`/dashboard/apps/${selectedApp.id}/templates`)}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EditorPage;
