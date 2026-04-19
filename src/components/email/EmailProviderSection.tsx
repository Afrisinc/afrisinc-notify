'use client';

import React, { useState } from 'react';
import { useEmailProvider, useResetEmailProvider } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Trash2, Shield, Lock } from 'lucide-react';
import { GmailSection } from './GmailSection';
import { EmailDomainSection } from './EmailDomainSection';
import { GmailIcon, NotifyIcon, CustomDomainIcon } from './BrandIcons';

interface EmailProviderSectionProps {
  appId: string;
}

export function EmailProviderSection({ appId }: EmailProviderSectionProps) {
  const { toast } = useToast();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Auto-select Gmail tab if OAuth params present
  const params = new URLSearchParams(window.location.search);
  const hasOAuthParams = params.has('code') && params.has('state');
  const [activeTab, setActiveTab] = useState(hasOAuthParams ? 'gmail' : 'simple');

  const { data: emailProvider, isLoading } = useEmailProvider(appId);
  const resetProviderMutation = useResetEmailProvider();

  const handleRemoveProvider = async () => {
    try {
      await resetProviderMutation.mutateAsync({ appId });
      setShowRemoveConfirm(false);
      toast({
        title: 'Success',
        description: 'Email provider removed. Configure a new one to start sending emails.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to remove email provider'),
        variant: 'destructive',
      });
    }
  };

  const getProviderIcon = () => {
    switch (emailProvider?.provider) {
      case 'gmail':
        return <GmailIcon className="h-5 w-5" />;
      case 'custom_domain':
        return <CustomDomainIcon className="h-5 w-5 text-blue-500" />;
      case 'notify':
        return <NotifyIcon className="h-5 w-5 text-indigo-600" />;
      default:
        return <Mail className="h-5 w-5 text-content-secondary" />;
    }
  };

  const getProviderLabel = () => {
    switch (emailProvider?.provider) {
      case 'notify':
        return 'Notify (Simple)';
      case 'gmail':
        return 'Gmail';
      case 'custom_domain':
        return 'Custom Domain';
      default:
        return 'Email Provider';
    }
  };

  const getProviderDescription = () => {
    if (!emailProvider) return null;

    switch (emailProvider.provider) {
      case 'notify':
        return emailProvider.fromEmail;
      case 'gmail':
        return emailProvider.gmailEmail;
      case 'custom_domain':
        return emailProvider.domain;
      default:
        return null;
    }
  };

  const isVerified = () => {
    if (!emailProvider) return false;
    if (emailProvider.provider === 'custom_domain') {
      return emailProvider.spfVerified && emailProvider.dkimVerified;
    }
    return true;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Provider
          </CardTitle>
          <CardDescription>Configure how your app sends emails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Provider configured - show status only
  if (emailProvider?.isActive) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getProviderIcon()}
              <div>
                <CardTitle className="text-base">{getProviderLabel()}</CardTitle>
                <CardDescription className="mt-1">{getProviderDescription()}</CardDescription>
              </div>
            </div>
            <Badge
              variant={isVerified() ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              {isVerified() ? 'Verified' : 'Pending'}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-content mb-2">Provider Details</h4>
              <div className="space-y-2 text-sm">
                {emailProvider.provider === 'custom_domain' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-content-secondary">Domain:</span>
                      <span className="font-mono text-content">{emailProvider.domain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-secondary">SPF:</span>
                      <Badge variant={emailProvider.spfVerified ? 'default' : 'secondary'} className="text-xs">
                        {emailProvider.spfVerified ? '✓ Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-secondary">DKIM:</span>
                      <Badge variant={emailProvider.dkimVerified ? 'default' : 'secondary'} className="text-xs">
                        {emailProvider.dkimVerified ? '✓ Verified' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-content-secondary">DMARC:</span>
                      <Badge variant={emailProvider.dmarcVerified ? 'default' : 'secondary'} className="text-xs">
                        {emailProvider.dmarcVerified ? '✓ Verified' : 'Optional'}
                      </Badge>
                    </div>
                  </>
                )}
                {emailProvider.provider === 'gmail' && (
                  <div className="flex justify-between">
                    <span className="text-content-secondary">Gmail Account:</span>
                    <span className="font-mono text-content">
                      {emailProvider.gmailEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-content-secondary mb-3">
                To switch to a different email provider, remove this configuration and set up a new one.
              </p>
              <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Provider
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Email Provider?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will stop using {getProviderLabel()} for sending emails. You'll need to configure a new email provider to continue sending.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemoveProvider}
                      disabled={resetProviderMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {resetProviderMutation.isPending ? 'Removing...' : 'Remove'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No provider configured - show all options
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" /> Email Provider
        </CardTitle>
        <CardDescription>Choose how your app will send emails. Only one provider can be active at a time.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="custom">Custom Domain</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="mt-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-content mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Simple Email Configuration
                </h4>
                <p className="text-xs text-content-secondary mb-4">
                  Configure a simple sender email address. Ensure the sender domain allows sending from your app.
                </p>
              </div>
              {/* Simple config component would go here */}
              <p className="text-sm text-content-secondary italic">Configure in dedicated Simple Email Provider tab</p>
            </div>
          </TabsContent>

          <TabsContent value="gmail" className="mt-6">
            <div className="space-y-4">
              <GmailSection appId={appId} />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <div className="space-y-4">
              <EmailDomainSection appId={appId} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
