import type { ComponentType } from 'react';

export type TemplateCategory =
  | 'Portfolio'
  | 'Web'
  | 'Analytics'
  | 'Infrastructure'
  | 'Logistics';

export type TemplateAccentFamily =
  | 'sky'
  | 'orange'
  | 'amber'
  | 'emerald'
  | 'violet'
  | 'blue';

export type RadiusScale =
  | 'default'
  | 'sharp'
  | 'balanced'
  | 'rounded'
  | 'pill';

export type FontFamilyChoice = 'default' | 'sans' | 'serif' | 'mono';

export type DensityChoice =
  | 'default'
  | 'compact'
  | 'comfortable'
  | 'spacious';

export interface TemplateCustomField {
  key: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface TemplateThemeTokens {
  accentColor: string;
  radiusScale: RadiusScale;
  fontFamily: FontFamilyChoice;
  density: DensityChoice;
}

export interface TemplateCustomization {
  tokens: TemplateThemeTokens;
  copy: Record<string, string>;
}

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
  accentFamily?: TemplateAccentFamily;
  customFields?: TemplateCustomField[];
}

export interface TemplateFile {
  filename: string;
  targetPath: string;
  content: string;
}

export interface TemplatePreviewProps {
  inspect?: boolean;
  customization?: TemplateCustomization;
}

export interface TemplateEntry {
  meta: TemplateMeta;
  Preview: ComponentType<TemplatePreviewProps>;
  files: TemplateFile[];
  markdown: string;
}
