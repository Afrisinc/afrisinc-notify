import React, { CSSProperties, useState } from "react";

import { Box, useTheme } from "@mui/material";

import { useCurrentBlockId } from "../../../editor/EditorBlock";
import {
  setSelectedBlockId,
  useSelectedBlockId,
} from "../../../editor/EditorContext";

import TuneMenu from "./TuneMenu";

type TEditorBlockWrapperProps = {
  children: JSX.Element;
};

export default function EditorBlockWrapper({
  children,
}: TEditorBlockWrapperProps) {
  const theme = useTheme();
  const selectedBlockId = useSelectedBlockId();
  const [mouseInside, setMouseInside] = useState(false);
  const blockId = useCurrentBlockId();

  const primaryColor = theme.palette.primary.main;
  let outline: CSSProperties["outline"];
  if (selectedBlockId === blockId) {
    outline = `2px solid ${primaryColor}`;
  } else if (mouseInside) {
    outline = `2px solid ${primaryColor}33`;
  }

  const renderMenu = () => {
    if (selectedBlockId !== blockId) {
      return null;
    }
    return <TuneMenu blockId={blockId} />;
  };

  return (
    <Box
      sx={{
        position: "relative",
        maxWidth: "100%",
        outlineOffset: "-1px",
        outline,
      }}
      onMouseEnter={(ev) => {
        setMouseInside(true);
        ev.stopPropagation();
      }}
      onMouseLeave={() => {
        setMouseInside(false);
      }}
      onClick={(ev) => {
        setSelectedBlockId(blockId);
        ev.stopPropagation();
        ev.preventDefault();
      }}
    >
      {renderMenu()}
      {children}
    </Box>
  );
}
