import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'saas-landing',
  name: 'Swiss Brutalist SaaS',
  category: 'Web',
  styleTag: 'Swiss Brutalist',
  styleFull: 'Swiss Brutalist Light Grid',
  swatchBg: '#FAFAFA',
  swatchAccent: '#FF4500',
  swatchBorder: '#0A0A0A',
  description:
    'High-contrast Swiss International Style landing page on stark #FAFAFA paper with 2px solid #0A0A0A grid rules, zero border radius, vermilion #FF4500 hard-shadow CTAs, an interactive CLI copy terminal, 2x2 boxed telemetry stats, and numbered feature rows.',
  dependencies: ['lucide-react'],
  targetDir: 'src/components/saas-landing',
  defaultInstruction:
    'Preserve the exact #FAFAFA surface, #0A0A0A 2px grid borders, 0px sharp corners, and #FF4500 hard-shadow CTAs. Wire your product copy, CLI install command, 4 metrics, and 3 numbered features via SwissLandingProps.',
};
