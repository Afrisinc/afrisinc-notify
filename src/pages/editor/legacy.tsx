/**
 * Legacy Editor Route Handler
 * Handles old /editor/:templateId format
 * Attempts to use selectedApp from context or shows error
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import EmailEditor from "@/components/EmailEditor/EmailEditor";

const EditorPageLegacy = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { selectedApp } = useAppContext();

  // If selectedApp is available, use it with the template
  if (selectedApp && templateId) {
    return (
      <EmailEditor
        appId={selectedApp.id}
        templateId={templateId}
        onCancel={() => navigate(`/dashboard/apps/${selectedApp.id}/templates`)}
      />
    );
  }

  // Otherwise show error and guide user
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center max-w-md">
        <p className="text-lg font-semibold text-foreground mb-2">
          Invalid Editor Link
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          This editor link is outdated. Please navigate to the editor from your
          app's templates page.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => navigate("/dashboard/apps")}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            Go to Apps
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPageLegacy;
