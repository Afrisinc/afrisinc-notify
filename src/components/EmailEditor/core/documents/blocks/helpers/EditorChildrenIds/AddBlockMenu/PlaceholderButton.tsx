import React from "react";

import { Plus } from "lucide-react";
import { ButtonBase, useTheme } from "@mui/material";

type Props = {
  onClick: () => void;
};
export default function PlaceholderButton({ onClick }: Props) {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
      sx={{
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        height: 48,
        width: "100%",
        bgcolor: theme.palette.action.hover,
      }}
    >
      <Plus
        size={20}
        style={{
          padding: 2,
          backgroundColor: theme.palette.primary.main,
          borderRadius: 24,
          color: theme.palette.primary.contrastText,
        }}
      />
    </ButtonBase>
  );
}
