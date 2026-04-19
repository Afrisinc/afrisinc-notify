'use client';

import React, { useState, useEffect } from 'react';
import {
  useEmailProvider,
  useGmailOAuthUrl,
  useSaveGmailOAuthCallback,
  useSetGmailAppPassword,
  useResetEmailProvider,
} from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Mail, Trash2, Loader, LogIn, ExternalLink, AlertCircle } from 'lucide-react';

interface EmailSectionProps {
  appId: string;
}

type Step = 'list' | 'connect' | 'connected';

export function GmailSection({ appId }: EmailSectionProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('list');
  const [authMethod, setAuthMethod] = useState<'oauth2' | 'app_password'>('oauth2');
  const [appPassword, setAppPassword] = useState('');
  const [appPasswordEmail, setAppPasswordEmail] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Queries and mutations
  const { data: emailProvider, isLoading: configLoading } = useEmailProvider(appId);
  const getOAuthUrlMutation = useGmailOAuthUrl();
  const saveOAuthCallbackMutation = useSaveGmailOAuthCallback();
  const saveAppPasswordMutation = useSetGmailAppPassword();
  const resetProviderMutation = useResetEmailProvider();

  // Check if Gmail is configured
  const gmailConfig = emailProvider?.provider === 'gmail' ? emailProvider : null;

  // Check for OAuth callback parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    console.log('GmailSection - OAuth params check:', { code: !!code, state: !!state, url: window.location.search });

    // Process callback if code and state exist and no other OAuth params in URL (to prevent re-triggering)
    if (code && state && !window.location.search.includes('oauth_processed')) {
      console.log('GmailSection - Processing OAuth callback');
      // Mark as processed to prevent re-triggering
      const newParams = new URLSearchParams(window.location.search);
      newParams.append('oauth_processed', 'true');
      window.history.replaceState({}, document.title, `?${newParams.toString()}`);

      handleOAuthCallback(code, state);
    }
  }, []);

  // Update step based on config status
  useEffect(() => {
    if (gmailConfig) {
      setStep('connected');
    } else if (step === 'connected') {
      setStep('list');
    }
  }, [gmailConfig]);

  const handleOAuthConnect = async () => {
    try {
      const result = await getOAuthUrlMutation.mutateAsync({ appId });
      // Store state and referrer in sessionStorage for verification and redirect
      sessionStorage.setItem('oauth_state', result.state);
      // Store clean referrer without OAuth params
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      url.searchParams.delete('oauth_processed');
      sessionStorage.setItem('oauth_referrer', url.pathname + url.search);
      // Redirect to Google's OAuth consent screen
      window.location.href = result.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to initiate OAuth'),
        variant: 'destructive',
      });
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      // Verify state token for CSRF protection
      const savedState = sessionStorage.getItem('oauth_state');
      if (savedState !== state) {
        throw new Error('Invalid state token - potential CSRF attack');
      }

      console.log('GmailSection - Calling OAuth callback with:', { appId, code: !!code, state: !!state });
      const result = await saveOAuthCallbackMutation.mutateAsync({
        appId,
        payload: { code, state },
      });
      console.log('GmailSection - OAuth callback result:', result);

      // Get referrer page, default to home
      const referrer = sessionStorage.getItem('oauth_referrer') || '/';

      // Clear sessionStorage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_referrer');

      toast({
        title: 'Success',
        description: 'Gmail account connected successfully!',
      });

      // Wait a moment for database to commit, then redirect
      setTimeout(() => {
        window.location.href = referrer;
      }, 1000);
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to connect Gmail'),
        variant: 'destructive',
      });
    }
  };

  const handleSaveAppPassword = async () => {
    if (!appPasswordEmail || !appPassword) {
      toast({
        title: 'Error',
        description: 'Email and app password are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveAppPasswordMutation.mutateAsync({
        appId,
        payload: {
          email: appPasswordEmail,
          appPassword,
        },
      });

      setAppPassword('');
      setAppPasswordEmail('');

      toast({
        title: 'Success',
        description: 'Gmail app password configured successfully!',
      });
    } catch (error) {
      console.error('Error saving app password:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to save app password'),
        variant: 'destructive',
      });
    }
  };

  const handleRemoveGmail = async () => {
    try {
      await resetProviderMutation.mutateAsync({ appId });
      setShowRemoveConfirm(false);
      toast({
        title: 'Success',
        description: 'Gmail configuration removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to remove Gmail config'),
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (configLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Gmail
          </CardTitle>
          <CardDescription>Send emails through your Gmail account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not connected - show empty state
  if (step === 'list') {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Gmail
          </CardTitle>
          <CardDescription>Send emails through your Gmail account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Mail className="h-12 w-12 icon-muted mx-auto" />
            <div>
              <h3 className="text-sm font-medium text-content mb-1">No Gmail account connected</h3>
              <p className="text-sm text-content-secondary">Connect your Gmail account to send emails through it.</p>
            </div>
            <Button onClick={() => setStep('connect')}>
              <LogIn className="h-4 w-4 mr-2" /> Connect Gmail
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connect - show authentication options
  if (step === 'connect') {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Connect Gmail Account</CardTitle>
          <CardDescription>Choose how to authenticate with Gmail.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'oauth2' | 'app_password')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth2">OAuth2 (Recommended)</TabsTrigger>
              <TabsTrigger value="app_password">App Password</TabsTrigger>
            </TabsList>

            {/* OAuth2 Tab */}
            <TabsContent value="oauth2" className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  OAuth2 is the most secure method. Google will ask for your permission once.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Click the button below to sign in with your Google account. You'll be redirected to Google's login page.
                </p>
                <Button
                  onClick={handleOAuthConnect}
                  disabled={getOAuthUrlMutation.isPending}
                  className="w-full"
                >
                  {getOAuthUrlMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in with Google
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* App Password Tab */}
            <TabsContent value="app_password" className="space-y-4">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Requires 2-factor authentication enabled on your Google Account.{' '}
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Learn how to create an app password
                    <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="gmail-email">Gmail Email Address</Label>
                  <Input
                    id="gmail-email"
                    type="email"
                    placeholder="your-email@gmail.com"
                    value={appPasswordEmail}
                    onChange={(e) => setAppPasswordEmail(e.target.value)}
                    disabled={saveAppPasswordMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="app-password">16-Character App Password</Label>
                  <Input
                    id="app-password"
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value.replace(/\s/g, ''))}
                    disabled={saveAppPasswordMutation.isPending}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in Google Account Settings → Security → App passwords
                  </p>
                </div>

                <Button
                  onClick={handleSaveAppPassword}
                  disabled={saveAppPasswordMutation.isPending || !appPasswordEmail || !appPassword}
                  className="w-full"
                >
                  {saveAppPasswordMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save App Password'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          <Button
            variant="outline"
            onClick={() => setStep('list')}
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected - show current config
  if (step === 'connected' && gmailConfig) {
    const expiryDate = gmailConfig.oauthTokenExpiry
      ? new Date(gmailConfig.oauthTokenExpiry).toLocaleDateString()
      : null;

    return (
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Gmail
              </CardTitle>
              <CardDescription className="mt-1">{gmailConfig.gmailEmail}</CardDescription>
            </div>
            <Badge variant="default">Connected</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-success/10 border-success/30">
            <Mail className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Emails will be sent from <span className="font-medium">{gmailConfig.gmailEmail}</span>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Authentication Method</span>
              <Badge variant="secondary">{gmailConfig.method === 'oauth2' ? 'OAuth2' : 'App Password'}</Badge>
            </div>
            {expiryDate && gmailConfig.method === 'oauth2' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Token Expires</span>
                <span className="text-gray-900">{expiryDate}</span>
              </div>
            )}
          </div>

          <Separator />

          <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive w-full">
                <Trash2 className="h-4 w-4 mr-2" /> Disconnect Gmail
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Gmail?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove Gmail as your email provider. Emails will use other configured providers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveGmail}
                  disabled={resetProviderMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {resetProviderMutation.isPending ? 'Removing...' : 'Disconnect'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  return null;
}
