import type { ComponentType } from 'react';

export type TemplateCategory =
  | 'Portfolio'
  | 'Web'
  | 'Analytics'
  | 'Infrastructure'
  | 'Logistics';

export interface TemplateMeta {
  slug: string;
  name: string;
  category: TemplateCategory;
  styleTag: string;
  styleFull: string;
  swatchBg: string;
  swatchAccent: string;
  swatchBorder: string;
  description: string;
  dependencies: string[];
  targetDir: string;
  defaultInstruction: string;
}

export interface TemplateFile {
  filename: string;
  targetPath: string;
  content: string;
}

export interface TemplatePreviewProps {
  inspect?: boolean;
}

export interface TemplateEntry {
  meta: TemplateMeta;
  Preview: ComponentType<TemplatePreviewProps>;
  files: TemplateFile[];
  markdown: string;
}
