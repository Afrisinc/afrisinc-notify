import { useState } from "react";

import { Upload } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";

import ImportJsonDialog from "./ImportJsonDialog";

export default function ImportJson() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Import JSON">
        <IconButton onClick={() => setOpen(true)}>
          <Upload size={20} />
        </IconButton>
      </Tooltip>
      <ImportJsonDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
