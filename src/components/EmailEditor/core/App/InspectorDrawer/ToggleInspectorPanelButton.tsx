import React from "react";

import { FileText, ChevronLast } from "lucide-react";
import { IconButton } from "@mui/material";

import {
  toggleInspectorDrawerOpen,
  useInspectorDrawerOpen,
} from "../../documents/editor/EditorContext";

export default function ToggleInspectorPanelButton() {
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const handleClick = () => {
    toggleInspectorDrawerOpen();
  };
  if (inspectorDrawerOpen) {
    return (
      <IconButton onClick={handleClick}>
        <ChevronLast size={20} />
      </IconButton>
    );
  }
  return (
    <IconButton onClick={handleClick}>
      <FileText size={20} />
    </IconButton>
  );
}
