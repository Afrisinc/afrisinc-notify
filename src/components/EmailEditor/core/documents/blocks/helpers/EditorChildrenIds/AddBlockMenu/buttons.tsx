import React from "react";

import {
  User,
  Crop,
  Heading2,
  Minus,
  Code,
  Image,
  Plus,
  FileText,
  Square,
  Columns,
} from "lucide-react";

import { TEditorBlock } from "../../../../editor/core";

type TButtonProps = {
  label: string;
  icon: JSX.Element;
  block: () => TEditorBlock;
};
export const BUTTONS: TButtonProps[] = [
  {
    label: "Heading",
    icon: <Heading2 size={16} />,
    block: () => ({
      type: "Heading",
      data: {
        props: { text: "Hello friend" },
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    }),
  },
  {
    label: "Text",
    icon: <FileText size={16} />,
    block: () => ({
      type: "Text",
      data: {
        props: { text: "My new text block" },
        style: {
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
          fontWeight: "normal",
        },
      },
    }),
  },

  {
    label: "Button",
    icon: <Square size={16} />,
    block: () => ({
      type: "Button",
      data: {
        props: {
          text: "Button",
          url: "https://www.usewaypoint.com",
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Image",
    icon: <Image size={16} />,
    block: () => ({
      type: "Image",
      data: {
        props: {
          url: "https://assets.usewaypoint.com/sample-image.jpg",
          alt: "Sample product",
          contentAlignment: "middle",
          linkHref: null,
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Avatar",
    icon: <User size={16} />,
    block: () => ({
      type: "Avatar",
      data: {
        props: {
          imageUrl: "https://ui-avatars.com/api/?size=128",
          shape: "circle",
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Divider",
    icon: <Minus size={16} />,
    block: () => ({
      type: "Divider",
      data: {
        style: { padding: { top: 16, right: 0, bottom: 16, left: 0 } },
        props: {
          lineColor: "#D0D0D0",
        },
      },
    }),
  },
  {
    label: "Spacer",
    icon: <Crop size={16} />,
    block: () => ({
      type: "Spacer",
      data: {},
    }),
  },
  {
    label: "Html",
    icon: <Code size={16} />,
    block: () => ({
      type: "Html",
      data: {
        props: { contents: "<strong>Hello world</strong>" },
        style: {
          fontSize: 16,
          textAlign: null,
          padding: { top: 16, bottom: 16, left: 24, right: 24 },
        },
      },
    }),
  },
  {
    label: "Columns",
    icon: <Columns size={16} />,
    block: () => ({
      type: "ColumnsContainer",
      data: {
        props: {
          columnsGap: 16,
          columnsCount: 3,
          columns: [
            { childrenIds: [] },
            { childrenIds: [] },
            { childrenIds: [] },
          ],
        },
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },
  {
    label: "Container",
    icon: <Plus size={16} />,
    block: () => ({
      type: "Container",
      data: {
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
      },
    }),
  },

  // { label: 'ProgressBar', icon: <ProgressBarOutlined />, block: () => ({}) },
  // { label: 'LoopContainer', icon: <ViewListOutlined />, block: () => ({}) },
];
