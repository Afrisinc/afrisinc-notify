import React from "react";
import { useTheme } from "@mui/material";

import { useCurrentBlockId } from "../../editor/EditorBlock";
import {
  setDocument,
  setSelectedBlockId,
  useDocument,
} from "../../editor/EditorContext";
import EditorChildrenIds from "../helpers/EditorChildrenIds";

import { EmailLayoutProps } from "./EmailLayoutPropsSchema";

function getFontFamily(fontFamily: EmailLayoutProps["fontFamily"]) {
  const f = fontFamily ?? "MODERN_SANS";
  switch (f) {
    case "MODERN_SANS":
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif';
    case "BOOK_SANS":
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif';
    case "ORGANIC_SANS":
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif';
    case "GEOMETRIC_SANS":
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif';
    case "HEAVY_SANS":
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif';
    case "ROUNDED_SANS":
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif';
    case "MODERN_SERIF":
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
    case "BOOK_SERIF":
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif';
    case "MONOSPACE":
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace';
  }
}

export default function EmailLayoutEditor(props: EmailLayoutProps) {
  const childrenIds = props.childrenIds ?? [];
  const document = useDocument();
  const currentBlockId = useCurrentBlockId();
  const theme = useTheme();

  // Theme-aware defaults
  const backdropDefault =
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.grey[100];
  const canvasDefault = theme.palette.background.paper;
  const textDefault = theme.palette.text.primary;

  // Helper functions to detect light/dark colors
  const isLightColor = (color: string): boolean => {
    const lightColors = [
      "#FFFFFF",
      "#ffffff",
      "#FFF",
      "#fff",
      "#F5F5F5",
      "#f5f5f5",
      "#F2F5F7",
      "#f2f5f7",
    ];
    return lightColors.includes(color);
  };

  const isDarkColor = (color: string): boolean => {
    const darkColors = [
      "#000000",
      "#000",
      "#262626",
      "#242424",
      "#1A1A1A",
      "#1a1a1a",
    ];
    return darkColors.includes(color);
  };

  // Auto-swap colors in dark mode
  const canvasColor =
    theme.palette.mode === "dark" &&
    props.canvasColor &&
    isLightColor(props.canvasColor)
      ? canvasDefault
      : (props.canvasColor ?? canvasDefault);

  const backdropColor =
    theme.palette.mode === "dark" &&
    props.backdropColor &&
    isLightColor(props.backdropColor)
      ? backdropDefault
      : (props.backdropColor ?? backdropDefault);

  // Swap dark text to light in dark mode, and light text to dark in light mode
  const textColor =
    theme.palette.mode === "dark" &&
    props.textColor &&
    (isLightColor(props.textColor) || isDarkColor(props.textColor))
      ? textDefault
      : (props.textColor ?? textDefault);

  return (
    <div
      onClick={() => {
        setSelectedBlockId(null);
      }}
      style={{
        backgroundColor: backdropColor,
        color: textColor,
        fontFamily: getFontFamily(props.fontFamily),
        fontSize: "16px",
        fontWeight: "400",
        letterSpacing: "0.15008px",
        lineHeight: "1.5",
        margin: "0",
        padding: "32px 0",
        width: "100%",
        minHeight: "100%",
      }}
    >
      <table
        align="center"
        width="100%"
        style={{
          margin: "0 auto",
          maxWidth: "600px",
          backgroundColor: canvasColor,
          borderRadius: props.borderRadius ?? undefined,
          border: (() => {
            const v = props.borderColor;
            if (!v) {
              return undefined;
            }
            return `1px solid ${v}`;
          })(),
        }}
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
      >
        <tbody>
          <tr style={{ width: "100%" }}>
            <td>
              <EditorChildrenIds
                childrenIds={childrenIds}
                onChange={({ block, blockId, childrenIds }) => {
                  setDocument({
                    [blockId]: block,
                    [currentBlockId]: {
                      type: "EmailLayout",
                      data: {
                        ...document[currentBlockId].data,
                        childrenIds: childrenIds,
                      },
                    },
                  });
                  setSelectedBlockId(blockId);
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
