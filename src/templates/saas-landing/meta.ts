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
  accentFamily: 'orange',
  description:
    'High-contrast Swiss International Style landing page on stark #FAFAFA paper with 2px solid #0A0A0A grid rules, zero border radius, vermilion #FF4500 hard-shadow CTAs, an interactive CLI copy terminal, 2x2 boxed telemetry stats, and numbered feature rows.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/saas-landing',
  defaultInstruction:
    'Preserve the exact #FAFAFA surface, #0A0A0A 2px grid borders, 0px sharp corners, and #FF4500 hard-shadow CTAs. Wire your product copy, CLI install command, 4 metrics, and 3 numbered features via SwissLandingProps.',
  customFields: [
    {
      key: 'brandName',
      label: 'Brand Name',
      defaultValue: 'KINETIC // EDGE',
      placeholder: 'YOUR // BRAND',
    },
    {
      key: 'headlineLine1',
      label: 'Headline Line 1',
      defaultValue: 'ZERO COLD STARTS.',
      placeholder: 'PRIMARY HEADLINE.',
    },
    {
      key: 'subheadline',
      label: 'Subheadline',
      defaultValue:
        'Compile TypeScript and Rust isolates directly to 42 bare-metal PoPs. No container orchestration tax, no regional failover scripts, and deterministic p99 latency under load.',
      placeholder: 'Concise product value proposition',
      multiline: true,
    },
    {
      key: 'primaryCtaLabel',
      label: 'Primary CTA',
      defaultValue: 'Start Free Deployment',
      placeholder: 'Primary action label',
    },
    {
      key: 'cliCommand',
      label: 'CLI Command',
      defaultValue: 'npx kinetic-edge@latest deploy --all-regions',
      placeholder: 'npx your-cli@latest init',
    },
  ],
};
