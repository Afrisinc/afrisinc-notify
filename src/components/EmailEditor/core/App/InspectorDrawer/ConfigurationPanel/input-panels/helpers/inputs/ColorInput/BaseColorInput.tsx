import React, { useState } from "react";

import { Plus, X } from "lucide-react";
import { ButtonBase, InputLabel, Menu, Stack, useTheme } from "@mui/material";

import Picker from "./Picker";

// Moved to component to access theme
const getButtonSx = (theme: any) => ({
  border: "1px solid",
  borderColor: theme.palette.divider,
  width: 32,
  height: 32,
  borderRadius: "4px",
  bgcolor: theme.palette.background.paper,
});

type Props =
  | {
      nullable: true;
      label: string;
      onChange: (value: string | null) => void;
      defaultValue: string | null;
    }
  | {
      nullable: false;
      label: string;
      onChange: (value: string) => void;
      defaultValue: string;
    };
export default function ColorInput({
  label,
  defaultValue,
  onChange,
  nullable,
}: Props) {
  const theme = useTheme();
  const BUTTON_SX = getButtonSx(theme);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState(defaultValue);
  const handleClickOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const renderResetButton = () => {
    if (!nullable) {
      return null;
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      return null;
    }
    return (
      <ButtonBase
        onClick={() => {
          setValue(null);
          onChange(null);
        }}
      >
        <X size={16} style={{ color: theme.palette.text.secondary }} />
      </ButtonBase>
    );
  };

  const renderOpenButton = () => {
    if (value) {
      return (
        <ButtonBase
          onClick={handleClickOpen}
          sx={{ ...BUTTON_SX, bgcolor: value }}
        />
      );
    }
    return (
      <ButtonBase onClick={handleClickOpen} sx={{ ...BUTTON_SX }}>
        <Plus size={16} />
      </ButtonBase>
    );
  };

  return (
    <Stack alignItems="flex-start">
      <InputLabel sx={{ mb: 0.5 }}>{label}</InputLabel>
      <Stack direction="row" spacing={1}>
        {renderOpenButton()}
        {renderResetButton()}
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          sx: { height: "auto", padding: 0 },
        }}
      >
        <Picker
          value={value || ""}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
      </Menu>
    </Stack>
  );
}
