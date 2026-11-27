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
  accentFamily: 'sky',
  description:
    'A cosmic midnight personal portfolio featuring an animated HTML5 refractive glass spheres canvas, sticky frosted-glass pill navigation with an expandable drawer, multi-slide interactive project gallery cards, and a two-column work history & education timeline.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/glass-portfolio',
  defaultInstruction:
    'Wire your personal bio, metrics, multi-slide project showcases, work history, education, and social links into GlassPortfolioLayout via props without altering the refractive glass surfaces or cosmic midnight palette.',
  customFields: [
    {
      key: 'brandName',
      label: 'Name / Brand',
      defaultValue: 'Soren Vance',
      placeholder: 'Your name or studio',
    },
    {
      key: 'brandSubtitle',
      label: 'Role / Title',
      defaultValue: 'Staff Design Engineer',
      placeholder: 'Your role or discipline',
    },
    {
      key: 'headline',
      label: 'Hero Headline',
      defaultValue: 'Crafting tactile, optical software',
      placeholder: 'Main hero headline',
    },
    {
      key: 'bio',
      label: 'Hero Bio',
      defaultValue:
        'I architect high-frame-rate interactive interfaces, GPU-accelerated design systems, and spatial developer tools that bridge industrial clarity with liquid glass optics.',
      placeholder: 'Short bio statement',
      multiline: true,
    },
    {
      key: 'contactEmail',
      label: 'Contact Email',
      defaultValue: 'soren@vancelab.io',
      placeholder: 'you@domain.com',
    },
  ],
};
