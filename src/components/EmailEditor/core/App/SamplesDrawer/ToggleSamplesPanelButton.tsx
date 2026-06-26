import React from "react";

import { ChevronFirst, Menu } from "lucide-react";
import { IconButton } from "@mui/material";

import {
  toggleSamplesDrawerOpen,
  useSamplesDrawerOpen,
} from "../../documents/editor/EditorContext";

function useIcon() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  if (samplesDrawerOpen) {
    return <ChevronFirst size={20} />;
  }
  return <Menu size={20} />;
}

export default function ToggleSamplesPanelButton() {
  const icon = useIcon();
  return <IconButton onClick={toggleSamplesDrawerOpen}>{icon}</IconButton>;
}
