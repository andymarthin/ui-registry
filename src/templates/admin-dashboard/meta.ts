import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'admin-dashboard',
  name: 'Executive Admin Dashboard',
  category: 'Analytics',
  styleTag: 'Modular Admin',
  styleFull: 'Clean Modular SaaS Admin Workspace',
  swatchBg: '#F8FAFC',
  swatchAccent: '#2563EB',
  swatchBorder: '#E2E8F0',
  accentFamily: 'blue',
  description:
    'Multi-component SaaS admin dashboard with a collapsible sidebar and mobile drawer, a sticky header with global search, 7D/30D/90D timeframe toggle and notifications popover, sparkline KPI cards, an interactive SVG revenue chart with channel mix, an activity feed with quick actions, and a searchable, sortable orders table with a row detail panel.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/admin-dashboard',
  defaultInstruction:
    'Wire datasets, orders, activities, and notifications props to our internal billing & analytics API endpoints without altering layout or styling.',
  customFields: [
    {
      key: 'brandName',
      label: 'Brand Name',
      defaultValue: 'Meridian Cloud',
      placeholder: 'Your product or company name',
    },
    {
      key: 'workspaceLabel',
      label: 'Workspace Label',
      defaultValue: 'Enterprise Workspace',
      placeholder: 'Workspace or plan name',
    },
    {
      key: 'pageTitle',
      label: 'Page Title',
      defaultValue: 'Executive Overview',
      placeholder: 'Dashboard heading',
    },
    {
      key: 'pageSubtitle',
      label: 'Page Subtitle',
      defaultValue:
        'Revenue performance, order velocity, and team operations across active billing cycles.',
      placeholder: 'Short supporting description',
      multiline: true,
    },
  ],
  design: {
    id: 'modular-saas-admin',
    version: '1.0.0',
    mode: 'light',
    summary:
      'Clean modular SaaS admin workspace on a Slate-50 (#F8FAFC) canvas with crisp white (#FFFFFF) rounded-xl cards, Slate-200 (#E2E8F0) hairlines, and Royal Blue (#2563EB) interactive states.',
    palette: {
      canvas: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceElevated: '#F8FAFC',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#2563EB',
      accentForeground: '#FFFFFF',
      semantic: {
        success: '#047857',
        warning: '#B45309',
        danger: '#BE123C',
        info: '#1D4ED8',
      },
    },
    typography: {
      display: 'System Sans (font-sans font-semibold tracking-tight text-slate-900)',
      body: 'System Sans (font-sans text-sm text-slate-500)',
      mono: 'System Sans with tabular-nums for KPI values, order IDs, amounts, dates, and pagination',
      headingScale:
        'Page title: text-lg sm:text-xl font-semibold tracking-tight; KPI metric: text-3xl font-bold tracking-tight tabular-nums; Card title: text-base font-semibold',
      bodyScale:
        'Body/table: text-sm; secondary metadata/buttons: text-xs; micro uppercase labels: text-[11px] font-semibold uppercase tracking-wide',
    },
    geometry: {
      radius:
        'Cards/Drawers/Popovers: rounded-xl; Buttons/Inputs/Nav items: rounded-lg; Segmented items: rounded-md; Status badges/filters: rounded-full',
      borderStyle:
        '1px Slate-200 hairlines (border-slate-200 or border-slate-200/90, divide-y divide-slate-100) and ring-1 semantic status pills',
      spacing:
        'App shell: collapsible w-64/w-[72px] sidebar + sticky header; main px-4 py-6 sm:px-6 space-y-6; card padding p-5; grid gap-4 to gap-6',
      containerMaxWidth:
        'Full-width fluid shell (min-h-[780px] w-full) with 256px/72px sidebar and fluid main column',
    },
    elevation:
      'Subtle layered elevation: shadow-xs on cards, shadow-sm on emblem and active toggles, shadow-xl on notifications popover, slide-over order detail drawer, and mobile drawer; sticky header uses bg-white/95 backdrop-blur-sm',
    motion:
      'Smooth sidebar width collapse (transition-[width] duration-200), switch knob translate-x, keyboard-navigable SVG bar selection, and transition-colors on rows/buttons',
    components: [
      'DashboardSidebar (collapsible w-64/w-[72px] rail + mobile drawer with grouped nav and workspace usage card)',
      'DashboardHeader (sticky header with global search, notifications popover, user badge, and 7D/30D/90D segmented control)',
      'KpiCardsRow (4-column sparkline KPI cards with SVG gradient area trends and delta pills)',
      'RevenueChartCard (interactive SVG bar+line Revenue vs. Expenses chart + Acquisition Channel Mix progress bars)',
      'ActivityFeedCard (scrollable actor feed with category badges and 2x2 Quick Actions grid with Done feedback)',
      'OrdersTableCard (searchable, status-filtered, sortable, paginated table with accessible slide-over Order Detail drawer)',
    ],
    doRules: [
      'Place white (#FFFFFF) rounded-xl cards with border-slate-200/90 and shadow-xs on the #F8FAFC (slate-50) canvas.',
      'Use #2563EB (blue-600) for primary fills, active chart bars, and sparkline strokes, paired with blue-50/blue-700 for active nav and filter states.',
      'Use ring-1 semantic status pills (emerald for paid, blue for processing, amber for pending, rose for refunded).',
      'Support keyboard navigation, focus-visible rings (ring-blue-500), and tabular-nums alignment across tables and charts.',
    ],
    dontRules: [
      'Do not switch to dark surfaces or drop the slate-50 vs white card contrast.',
      'Do not use 0px brutalist borders or heavy drop shadows on standard dashboard cards.',
      'Do not introduce custom CSS files or uncoordinated accent colors outside the blue + semantic slate palette.',
      'Do not break the modular layout shell (sidebar + sticky header + responsive 12-column widget grid).',
    ],
  },
};
