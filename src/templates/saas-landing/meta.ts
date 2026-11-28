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
  design: {
    id: 'swiss-brutalist-grid',
    version: '1.0.0',
    mode: 'light',
    summary:
      'High-contrast Swiss International Style landing architecture on #FAFAFA paper framed by 2px solid #0A0A0A grid rules, 0px sharp corners, and vermilion #FF4500 hard-shadow CTAs.',
    palette: {
      canvas: '#FAFAFA',
      surface: '#FAFAFA',
      surfaceElevated: '#0A0A0A',
      text: '#0A0A0A',
      textMuted: '#525252',
      border: '#0A0A0A',
      accent: '#FF4500',
      accentForeground: '#FAFAFA',
      semantic: {
        info: '#262626',
      },
    },
    typography: {
      display:
        'System Sans (font-sans font-black uppercase tracking-[-0.04em] leading-[0.95])',
      body: 'System Sans (font-sans font-medium leading-relaxed text-[#262626])',
      mono: 'Monospace (font-mono) for nav links, kickers, badges, CLI terminal, stat values (tabular-nums), and CTAs',
      headingScale:
        'h1: text-[30px] sm:text-5xl lg:text-[56px] font-black uppercase leading-[0.95] tracking-[-0.04em]; h2: text-2xl sm:text-3xl font-black uppercase tracking-[-0.03em]; h3: text-lg sm:text-xl font-black uppercase',
      bodyScale:
        'Lead: text-base sm:text-lg font-medium; Feature body: text-sm sm:text-[15px]; Mono labels/badges: text-[10px]–text-xs uppercase tracking-[0.12em]–[0.16em]',
    },
    geometry: {
      radius:
        '0px everywhere (explicit rounded-none across all badges, buttons, terminal, and grid cells)',
      borderStyle:
        'Heavy 2px solid #0A0A0A structural grid rules (border-2, border-x-2, border-b-2, border-r-2, divide-y-2)',
      spacing:
        'Structured cells (px-4 sm:px-6 lg:px-10, py-6–py-12); 12-column hero split (lg:col-span-7 / lg:col-span-5); 2x2 stats grid with shared borders',
      containerMaxWidth: 'max-w-[1320px] with sm:border-x-2 border-[#0A0A0A]',
    },
    elevation:
      'Zero blur or soft shadows; depth uses hard offset brutalist shadow on primary CTA (shadow-[4px_4px_0px_#0A0A0A]) and flat surface inversion',
    motion:
      'Tactile hard-shadow press physics (hover translate 1px, active translate 4px with shadow-none) plus instant color inversion transitions (transition-colors)',
    components: [
      'TopBar (full-width bordered header with square brand code tile, uppercase nav, and inverted hover CTA)',
      'HeroSection (12-column asymmetric split combining stacked uppercase display headline and interactive #0A0A0A CLI copy terminal)',
      'StatsGrid (2x2 boxed telemetry grid with indexed cells 01–04 and tabular-nums metrics)',
      'FeatureRows (numbered 12-column horizontal rows divided by 2px #0A0A0A rules with tag badges and metric links)',
      'FooterBar (monospace split status bar)',
    ],
    doRules: [
      'Enforce rounded-none (0px border radius) on every container, button, badge, and input.',
      'Connect sections with shared 2px solid #0A0A0A borders inside the max-w-[1320px] frame.',
      'Style primary CTAs with bg-[#FF4500], 2px #0A0A0A border, and shadow-[4px_4px_0px_#0A0A0A] press translation.',
      'Use font-mono uppercase with wide tracking for navigation, kickers, badges, and numerical telemetry.',
    ],
    dontRules: [
      'Do not add rounded corners or glassmorphism/backdrop blur.',
      'Do not use soft diffused drop shadows instead of hard offset #0A0A0A shadows.',
      'Do not introduce muted gray borders; structural dividers must stay crisp #0A0A0A.',
      'Do not use gradients or pastel background tints.',
    ],
  },
};
