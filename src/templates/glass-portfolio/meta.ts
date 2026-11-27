import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'glass-portfolio',
  name: 'Liquid Glass Portfolio',
  category: 'Portfolio',
  styleTag: 'Liquid Glass',
  styleFull: 'Liquid Glass + Refractive Spheres',
  swatchBg: '#05060D',
  swatchAccent: '#60A5FA',
  swatchBorder: '#1E293B',
  description:
    'A cosmic midnight personal portfolio featuring an animated HTML5 refractive glass spheres canvas, sticky frosted-glass pill navigation with an expandable drawer, multi-slide interactive project gallery cards, and a two-column work history & education timeline.',
  dependencies: ['lucide-react'],
  targetDir: 'src/components/glass-portfolio',
  defaultInstruction:
    'Wire your personal bio, metrics, multi-slide project showcases, work history, education, and social links into GlassPortfolioLayout via props without altering the refractive glass surfaces or cosmic midnight palette.',
};
