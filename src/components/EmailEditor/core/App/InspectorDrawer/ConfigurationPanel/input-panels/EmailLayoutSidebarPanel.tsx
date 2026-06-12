import React, { useMemo, useState } from "react";
import { ZodError } from "zod";

import { Circle } from "lucide-react";
import { useTheme } from "@mui/material";

import EmailLayoutPropsSchema, {
  EmailLayoutProps,
} from "../../../../documents/blocks/EmailLayout/EmailLayoutPropsSchema";

import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import ColorInput, { NullableColorInput } from "./helpers/inputs/ColorInput";
import { NullableFontFamily } from "./helpers/inputs/FontFamily";
import SliderInput from "./helpers/inputs/SliderInput";

type EmailLayoutSidebarFieldsProps = {
  data: EmailLayoutProps;
  setData: (v: EmailLayoutProps) => void;
};
export default function EmailLayoutSidebarFields({
  data,
  setData,
}: EmailLayoutSidebarFieldsProps) {
  const theme = useTheme();
  const [, setErrors] = useState<ZodError | null>(null);

  const defaults = useMemo(
    () => ({
      backdrop:
        theme.palette.mode === "dark"
          ? theme.palette.grey[900]
          : theme.palette.grey[100],
      canvas: theme.palette.background.paper,
      text: theme.palette.text.primary,
    }),
    [
      theme.palette.mode,
      theme.palette.grey,
      theme.palette.background.paper,
      theme.palette.text.primary,
    ],
  );

  const updateData = (d: unknown) => {
    const res = EmailLayoutPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  return (
    <BaseSidebarPanel title="Global">
      <ColorInput
        label="Backdrop color"
        defaultValue={data.backdropColor ?? defaults.backdrop}
        onChange={(backdropColor) => updateData({ ...data, backdropColor })}
      />
      <ColorInput
        label="Canvas color"
        defaultValue={data.canvasColor ?? defaults.canvas}
        onChange={(canvasColor) => updateData({ ...data, canvasColor })}
      />
      <NullableColorInput
        label="Canvas border color"
        defaultValue={data.borderColor ?? null}
        onChange={(borderColor) => updateData({ ...data, borderColor })}
      />
      <SliderInput
        iconLabel={<Circle size={16} style={{ color: "inherit" }} />}
        units="px"
        step={4}
        marks
        min={0}
        max={48}
        label="Canvas border radius"
        defaultValue={data.borderRadius ?? 0}
        onChange={(borderRadius) => updateData({ ...data, borderRadius })}
      />
      <NullableFontFamily
        label="Font family"
        defaultValue="MODERN_SANS"
        onChange={(fontFamily) => updateData({ ...data, fontFamily })}
      />
      <ColorInput
        label="Text color"
        defaultValue={data.textColor ?? defaults.text}
        onChange={(textColor) => updateData({ ...data, textColor })}
      />
    </BaseSidebarPanel>
  );
}
