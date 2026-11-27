import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'saas-analytics',
  name: 'Soft Bento Analytics',
  category: 'Analytics',
  styleTag: 'Soft Bento',
  styleFull: 'Soft Bento Obsidian Glow',
  swatchBg: '#09090B',
  swatchAccent: '#8B5CF6',
  swatchBorder: '#27272A',
  description:
    'Obsidian #09090B Soft Bento dark-mode SaaS analytics dashboard with violet/cyan ambient glows, rounded-3xl translucent tiles, interactive SVG area sparkline, KPI grid, and segmented channel bar.',
  dependencies: ['lucide-react'],
  targetDir: 'src/components/saas-analytics',
  defaultInstruction:
    'Build a B2B SaaS revenue and growth dashboard using the Soft Bento Dark template. Keep the #09090B obsidian canvas, violet/cyan radial ambient glows, rounded-3xl #18181B/70 surfaces, and border-white/[0.08] hairlines while passing real revenue series, KPI metrics, and acquisition channels via props.',
};
