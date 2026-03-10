import React, { createContext, useContext, useState, useEffect } from "react";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Load selected project from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selected_project");
    if (stored) {
      try {
        setSelectedProject(JSON.parse(stored));
      } catch {
        localStorage.removeItem("selected_project");
      }
    }
  }, []);

  // Save selected project to localStorage when it changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem("selected_project", JSON.stringify(selectedProject));
    } else {
      localStorage.removeItem("selected_project");
    }
  }, [selectedProject]);

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
