import { useState } from "react";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserProfile, useCreateProject } from "@/hooks/useTemplates";
import { useProject as useProjectContext } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectSelectorProps {
  collapsed?: boolean;
}

export function ProjectSelector({ collapsed = false }: ProjectSelectorProps) {
  const { user, loading: authLoading } = useAuth();
  const { selectedProject, setSelectedProject } = useProjectContext();
  const { data: userProfile, isLoading, refetch } = useUserProfile({
    enabled: !authLoading && !!user,
  });
  const createMutation = useCreateProject();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const newProject = await createMutation.mutateAsync({
        name: newProjectName,
        description: newProjectDescription || undefined,
      });

      // Set the new project as selected
      setSelectedProject(newProject);
      setNewProjectName("");
      setNewProjectDescription("");
      setShowCreateDialog(false);

      // Refetch projects
      refetch();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const displayName = selectedProject?.name || "Select Project";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-md bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
            <span className="truncate">{displayName}</span>
            {!collapsed && (
              <ChevronDown className="h-3 w-3 shrink-0 ml-2 text-sidebar-muted" />
            )}
          </button>
        </DropdownMenuTrigger>
        {/* <DropdownMenuContent align="start" className="w-48">
          {isLoading ? (
            <div className="px-2 py-2 text-xs text-muted-foreground text-center">
              Loading projects...
            </div>
          ) : userProfile && userProfile.projects && userProfile.projects.length > 0 ? (
            <>
              {userProfile.projects.map((project: any) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={selectedProject?.id === project.id ? "bg-accent" : ""}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : (
            <div className="px-2 py-2 text-xs text-muted-foreground text-center">
              No projects
            </div>
          )}
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-3 w-3 mr-2" />
            Create New Project
          </DropdownMenuItem>
        </DropdownMenuContent> */}
      </DropdownMenu>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your templates and notifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1 block">Project Name</Label>
              <Input
                placeholder="e.g., My App, Production, Staging"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Description (optional)</Label>
              <Input
                placeholder="e.g., Email templates for user onboarding"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="flex-1"
              >
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
