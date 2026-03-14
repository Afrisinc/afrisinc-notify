/**
 * Template types and interfaces for the Notify template gallery
 */

export type Channel = "email" | "sms" | "push" | "in-app";
export type Category = "authentication" | "transactional" | "marketing" | "alerts";

export interface Template {
  id: string;
  slug: string;
  name: string;
  description: string;
  channel: Channel;
  category: Category;
  author: string;
  isFree: boolean;
  content: TemplateContent;
  variables: TemplateVariable[];
  subject?: string | null;
  preview?: string;
  tags?: string[];
  language?: string;
  version?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateContent {
  email?: {
    subject?: string;
    html?: string;
    body?: string;
    text?: string;
  };
  sms?: {
    body: string;
  };
  push?: {
    title: string;
    body: string;
  };
  "in-app"?: {
    title: string;
    body: string;
  };
}

export interface TemplateVariable {
  name: string;
  type?: "string" | "email" | "number" | "url";
  example?: string;
  required: boolean;
}

export type TemplateFilter = "all" | Channel;
