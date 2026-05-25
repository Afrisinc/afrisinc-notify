import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "@/contexts/OrgContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Trash2 } from "lucide-react";
import {
  useGetOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const isValidEmail = (email: string) => {
  if (!email) return true; // Email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function OrgSettings() {
  const navigate = useNavigate();
  const { currentOrg, loading: orgLoading } = useOrg();
  const { toast } = useToast();

  // Fetch organization data from backend
  const { data: orgFromBackend } = useGetOrganization(currentOrg?.id || "");

  // Initialize with current org data from context
  const [originalData, setOriginalData] = useState({
    name: currentOrg?.name || "",
    legal_name: (currentOrg as any)?.legal_name || "",
    country: (currentOrg as any)?.country || "",
    org_email: (currentOrg as any)?.org_email || "",
    org_phone: (currentOrg as any)?.org_phone || "",
    location: (currentOrg as any)?.location || "",
  });

  const [formData, setFormData] = useState(originalData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();

  // Update form when org data from backend is received
  useEffect(() => {
    if (orgFromBackend) {
      const newData = {
        name: orgFromBackend.name || "",
        legal_name: (orgFromBackend as any).legalName || "",
        country: orgFromBackend.country || "",
        org_email: (orgFromBackend as any).orgEmail || "",
        org_phone: (orgFromBackend as any).orgPhone || "",
        location: orgFromBackend.location || "",
      };
      setOriginalData(newData);
      setFormData(newData);
    }
  }, [orgFromBackend?.id]);

  // Handle missing organization - early return AFTER all hooks
  if (!currentOrg) {
    if (orgLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-content-secondary">
              Loading organization settings...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-destructive/30">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">No organization selected</p>
            <Button onClick={() => navigate("/dashboard/apps")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get only changed fields
  const getChangedFields = () => {
    const changed: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      if (
        formData[key as keyof typeof formData] !==
        originalData[key as keyof typeof originalData]
      ) {
        changed[key] = formData[key as keyof typeof formData];
      }
    });

    return changed;
  };

  const hasChanges = Object.keys(getChangedFields()).length > 0;

  const handleSaveChanges = async () => {
    // Validate email format
    if (formData.org_email && !isValidEmail(formData.org_email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!hasChanges) {
      toast({
        title: "Info",
        description: "No changes to save",
      });
      return;
    }

    try {
      const changedFields = getChangedFields();
      await updateMutation.mutateAsync({
        orgId: currentOrg.id,
        payload: changedFields,
      });

      toast({
        title: "Success",
        description: "Organization updated successfully",
      });

      // Update original data to reflect saved changes
      setOriginalData(formData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update organization",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      await deleteMutation.mutateAsync(currentOrg.id);

      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });

      setShowDeleteDialog(false);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-content">
          Organization Settings
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Manage {currentOrg.name}
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> General Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium mb-1 block">
              Organization Name
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Your organization name"
            />
          </div>

          <div>
            <Label className="text-xs font-medium mb-1 block">Legal Name</Label>
            <Input
              value={formData.legal_name}
              onChange={(e) => handleInputChange("legal_name", e.target.value)}
              placeholder="Legal organization name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">Email</Label>
              <Input
                type="email"
                value={formData.org_email}
                onChange={(e) => handleInputChange("org_email", e.target.value)}
                placeholder="org@example.com"
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Phone</Label>
              <Input
                value={formData.org_phone}
                onChange={(e) => handleInputChange("org_phone", e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="US"
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveChanges}
            disabled={updateMutation.isPending || !hasChanges}
            className="mt-4"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-secondary mb-4">
            Deleting your organization will permanently remove all apps,
            templates, and data. This action cannot be undone.
          </p>
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Organization
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{currentOrg.name}"? This
                  action is permanent and will delete all apps, templates, and
                  data associated with this organization.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="bg-destructive/10 p-3 rounded text-sm text-destructive my-4">
                ⚠️ This action cannot be undone.
              </div>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOrganization}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending
                    ? "Deleting..."
                    : "Delete Organization"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
