import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInviteDetails, useAcceptInvite } from "@/hooks/useOrganization";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Building2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InviteAccept() {
  const { inviteId, token } = useParams<{ inviteId: string; token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: invite, isLoading: inviteLoading, error: inviteError } = useInviteDetails(
    inviteId || "",
    token || ""
  );
  const acceptMutation = useAcceptInvite();

  // Handle accept invite for logged-in users
  const handleAcceptInvite = async () => {
    if (!inviteId || !token) return;

    try {
      await acceptMutation.mutateAsync({ inviteId, token });

      toast({
        title: "Success",
        description: `You've been added to ${invite?.orgName} as a ${invite?.role}!`,
      });

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invite. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (inviteLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative p-4">
        <BackgroundDecorator />
        <Card className="w-full max-w-md relative z-10">
          <CardContent className="py-12 text-center">
            <p className="text-foreground/70 dark:text-foreground/80">Loading invite details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative p-4">
        <BackgroundDecorator />
        <Card className="w-full max-w-md border-destructive/30 relative z-10">
          <CardContent className="py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-center mb-2">Invalid or Expired Invite</h2>
            <p className="text-sm text-foreground/70 dark:text-foreground/80 text-center mb-6">
              This invite link is invalid or has expired. Please ask the organization admin to send you a new invite.
            </p>
            <Button onClick={() => navigate("/signin")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (invite.accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative p-4">
        <BackgroundDecorator />
        <Card className="w-full max-w-md border-success/30 relative z-10">
          <CardContent className="py-8">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-center mb-2">Already Accepted</h2>
            <p className="text-sm text-foreground/70 dark:text-foreground/80 text-center mb-6">
              This invite has already been accepted.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user email matches invite email
  const emailMismatch = user && user.email !== invite.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative p-4">
      <BackgroundDecorator />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle className="text-center">Join Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-foreground/70 dark:text-foreground/80">Organization</p>
                <p className="font-semibold">{invite.orgName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-foreground/70 dark:text-foreground/80">Invite Email</p>
                <p className="font-semibold">{invite.email}</p>
              </div>
            </div>
            <div className="text-xs text-foreground/70 dark:text-foreground/80">
              <p className="capitalize">Role: <span className="font-medium text-foreground">{invite.role}</span></p>
              <p>Invited by: <span className="font-medium text-foreground">{invite.invitedBy || invite.orgName}</span></p>
            </div>
          </div>

          {/* Email Mismatch Warning */}
          {emailMismatch && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm text-destructive">
                You are signed in as <strong>{user?.email}</strong>, but this invite is for <strong>{invite.email}</strong>.
              </p>
              <p className="text-xs text-destructive/80 mt-2">
                Please sign in with {invite.email} to accept this invite.
              </p>
            </div>
          )}

          {/* Logged In - Accept Button */}
          {user && !emailMismatch ? (
            <>
              <p className="text-sm text-foreground/70 dark:text-foreground/80 text-center">
                Click below to accept this invite and join {invite.orgName}
              </p>
              <Button
                onClick={handleAcceptInvite}
                disabled={acceptMutation.isPending}
                className="w-full"
              >
                {acceptMutation.isPending ? "Accepting..." : "Accept Invite"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/signin")}
                className="w-full"
              >
                Sign In with Different Account
              </Button>
            </>
          ) : (
            <>
              {/* Not Logged In - Register */}
              {!user ? (
                <>
                  <p className="text-sm text-foreground/70 dark:text-foreground/80 text-center">
                    Sign in or create an account to accept this invite
                  </p>
                  <Button onClick={() => navigate(`/signup?email=${invite.email}`)} className="w-full">
                    Create Account & Accept
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-foreground/70 dark:text-foreground/80">Or</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/signin?email=${invite.email}`)}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
