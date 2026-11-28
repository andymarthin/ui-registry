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
  accentFamily: 'violet',
  description:
    'Obsidian #09090B Soft Bento dark-mode SaaS analytics dashboard with violet/cyan ambient glows, rounded-3xl translucent tiles, interactive SVG area sparkline, KPI grid, and segmented channel bar.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/saas-analytics',
  defaultInstruction:
    'Build a B2B SaaS revenue and growth dashboard using the Soft Bento Dark template. Keep the #09090B obsidian canvas, violet/cyan radial ambient glows, rounded-3xl #18181B/70 surfaces, and border-white/[0.08] hairlines while passing real revenue series, KPI metrics, and acquisition channels via props.',
  customFields: [
    {
      key: 'workspaceName',
      label: 'Workspace Name',
      defaultValue: 'Vektor Telemetry',
      placeholder: 'Your product or workspace',
    },
    {
      key: 'title',
      label: 'Dashboard Title',
      defaultValue: 'Revenue & Growth Overview',
      placeholder: 'Primary dashboard heading',
    },
    {
      key: 'subtitle',
      label: 'Subtitle',
      defaultValue:
        'Net revenue velocity, retention cohort health, and channel attribution.',
      placeholder: 'Short overview subtitle',
      multiline: true,
    },
    {
      key: 'syncLabel',
      label: 'Sync Status',
      defaultValue: 'Live telemetry · Updated 2m ago',
      placeholder: 'Live telemetry status label',
    },
  ],
  design: {
    id: 'soft-bento-obsidian',
    version: '1.0.0',
    mode: 'dark',
    summary:
      'Obsidian (#09090B) Soft Bento dark-mode SaaS analytics dashboard featuring translucent zinc tiles (#18181B/70), rounded-3xl geometry, subtle white/[0.08] hairlines, and violet/cyan ambient radial glows.',
    palette: {
      canvas: '#09090B',
      surface: 'rgba(24, 24, 27, 0.70)',
      surfaceElevated: 'rgba(9, 9, 11, 0.80)',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#8B5CF6',
      accentForeground: '#FFFFFF',
      semantic: {
        success: '#6EE7B7',
        warning: '#FCD34D',
        danger: '#FDA4AF',
        info: '#22D3EE',
      },
    },
    typography: {
      display: 'System Sans (font-sans font-semibold tracking-tight text-zinc-50)',
      body: 'System Sans (font-sans text-zinc-400)',
      mono: 'System Sans with tabular-nums for numerical KPIs, chart readouts, axis labels, and channel shares',
      headingScale:
        'Hero metric: text-3xl sm:text-4xl font-semibold tabular-nums; h1: text-xl sm:text-2xl font-semibold; KPI value: text-2xl font-semibold tabular-nums; h2: text-sm font-semibold',
      bodyScale: 'Subtitle: text-sm; labels/deltas/axis: text-xs to text-[11px]',
    },
    geometry: {
      radius:
        'Bento tiles: rounded-3xl; Icon boxes/readouts/channel cards: rounded-2xl; Timeframe pills, deltas, progress bars: rounded-full',
      borderStyle:
        '1px translucent hairline borders (border-white/[0.08], inner cards border-white/[0.06], accent badges border-violet-400/25)',
      spacing:
        'Main container p-4 sm:p-6 lg:p-8, gap-5; tile padding p-5 sm:p-6; 12-column bento split (lg:col-span-7 hero / lg:col-span-5 2x2 KPIs)',
      containerMaxWidth: 'max-w-7xl (1280px)',
    },
    elevation:
      'Ambient radial background pools (violet 14% and cyan 10%) combined with backdrop-blur-md translucent #18181B/70 bento tiles and soft violet glow shadow (0 0 20px rgba(139,92,246,0.35)) on active controls',
    motion:
      'Interactive SVG point hover/focus/click inspection with guide line and halo circle; channel segment dimming (opacity-30 vs opacity-100, duration-200); smooth border hover transitions',
    components: [
      'AnalyticsHeader (bento top bar with workspace badge, live cyan dot, and 7D/30D/90D gradient timeframe switcher)',
      'HeroRevenueCard (7-column bento tile with cubic-bezier SVG area sparkline, interactive readout pill, and goal progress bar)',
      'KpiMetricGrid (2x2 sub-grid of rounded-3xl KPI tiles with colored icon wells and positive/negative delta pills)',
      'AcquisitionChannels (segmented horizontal attribution bar paired with 4 interactive legend tiles)',
    ],
    doRules: [
      'Build on the #09090B obsidian canvas with subtle violet (#8B5CF6) and cyan (#06B6D4) ambient radial glows behind cards.',
      'Use rounded-3xl tiles with bg-[#18181B]/70, backdrop-blur-md, and border-white/[0.08] hairlines.',
      'Use rounded-2xl for nested elements and rounded-full for timeframe switchers, delta pills, and segmented bars.',
      'Apply tabular-nums on all revenue numbers, percentages, and chart tooltips.',
    ],
    dontRules: [
      'Do not use sharp 0px corners or heavy solid gray borders.',
      'Do not place high-opacity white cards or flat light-mode surfaces inside the obsidian layout.',
      'Do not use harsh drop shadows instead of translucent hairlines and soft radial glows.',
      'Do not omit interactive hover/selection states on charts and segmented channel bars.',
    ],
  },
};
