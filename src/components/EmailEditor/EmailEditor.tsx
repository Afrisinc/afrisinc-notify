/**
 * EmailEditor Component
 *
 * Integrates the EmailBuilder.js visual editor with the Notify backend API.
 * Provides a professional email template editing interface with:
 * - Visual email template builder (EmailBuilder.js)
 * - Notify backend integration for template storage
 * - Real-time HTML + JSON rendering
 * - Template creation, editing, and export functionality
 * - Automatic cache invalidation via React Query
 *
 * Editor Flow:
 * 1. Load template from Notify API (/api/apps/:appId/templates/:templateId)
 * 2. Extract design_json from response
 * 3. Render design in EmailBuilder.js visual editor
 * 4. User edits template visually
 * 5. On save, render to HTML and embed JSON
 * 6. Save to Notify backend API
 * 7. React Query handles cache invalidation and refetch
 */

import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ArrowLeft, Save, Download, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import theme from './core/theme';
import App from './core/App';
import { useEmailEditor } from './hooks/useEmailEditor';
import { useToast } from '@/hooks/use-toast';
import { useInspectorDrawerOpen } from './core/documents/editor/EditorContext';
import { INSPECTOR_DRAWER_WIDTH } from './core/App/InspectorDrawer';

// Validation schema
const templateHeaderSchema = z.object({
  templateName: z.string().min(1, 'Template name is required').min(3, 'Template name must be at least 3 characters'),
  subject: z.string().min(1, 'Subject is required').min(3, 'Subject must be at least 3 characters'),
});

type TemplateHeaderFormData = z.infer<typeof templateHeaderSchema>;

interface EmailEditorProps {
  appId?: string;
  templateId: string;
  onCancel: () => void;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({ appId, templateId, onCancel }) => {
  const { toast } = useToast();
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  const {
    isLoading,
    isSaving,
    error,
    templateName,
    setTemplateName,
    subject,
    setSubject,
    save,
    exportHTML,
  } = useEmailEditor({ appId, templateId });

  // Initialize form with react-hook-form
  const form = useForm<TemplateHeaderFormData>({
    resolver: zodResolver(templateHeaderSchema),
    defaultValues: {
      templateName: templateName || '',
      subject: subject || '',
    },
    values: {
      templateName,
      subject,
    },
  });

  const isNewTemplate = templateId === 'new';

  const handleSave = async () => {
    // Validate form before saving
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      await save();
      toast({
        title: 'Success',
        description: isNewTemplate ? 'Template created successfully' : 'Template updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: error || `Failed to ${isNewTemplate ? 'create' : 'update'} template`,
        variant: 'destructive',
      });
    }
  };

  const handleExportHTML = () => {
    try {
      const html = exportHTML();
      // Create a blob and trigger download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'email'}.html`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Success',
        description: 'Email HTML exported successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to export HTML',
        variant: 'destructive',
      });
    }
  };

  // Show error as toast notification if template fails to load
  useEffect(() => {
    if (error) {
      toast({
        title: 'Template Loading Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* ── Notify Editor Header ── */}
      <header
        className="border-b border-border bg-card px-6 py-4 transition-all duration-300"
        style={{
          marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
        }}
      >
        <div className="mb-3">
          <p className="heading-label">
            Notify Email Template Editor
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back button + Template name & subject */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={onCancel}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <Form {...form}>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
                  <FormField
                    control={form.control}
                    name="templateName"
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-0">
                        <FormLabel className="text-xs">Template Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Welcome Email"
                            onChange={(e) => {
                              field.onChange(e);
                              setTemplateName(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-0">
                        <FormLabel className="text-xs">Subject</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Welcome to our platform"
                            onChange={(e) => {
                              field.onChange(e);
                              setSubject(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                {error}
              </div>
            )}

            <Button
              onClick={handleExportHTML}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Download email HTML for testing"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="gap-2"
              title={isNewTemplate ? 'Create new template' : 'Update template'}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">{isNewTemplate ? 'Creating...' : 'Updating...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">{isNewTemplate ? 'Save' : 'Update'}</span>
                </>
              )}
            </Button>

            <Button
              onClick={onCancel}
              disabled={isSaving}
              variant="ghost"
              size="sm"
              className="gap-2"
              title="Close editor without saving"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── MUI Email Builder (inside ThemeProvider) ── */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="flex-1 overflow-hidden">
          <App />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default EmailEditor;
