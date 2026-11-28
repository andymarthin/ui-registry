import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'logistics-hub',
  name: 'Enterprise Logistics Hub',
  category: 'Logistics',
  styleTag: 'Enterprise Light',
  styleFull: 'Enterprise Utility Light Workspace',
  swatchBg: '#FFFFFF',
  swatchAccent: '#2563EB',
  swatchBorder: '#E2E8F0',
  accentFamily: 'blue',
  description:
    'High-density enterprise freight and supply-chain control tower built on a crisp #FFFFFF workspace with a #F1F5F9 top utility bar, #2563EB royal blue primary actions, 4-column operational KPI strip, live-filterable shipment ledger, and an interactive shipment detail & milestone inspector.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/logistics-hub',
  defaultInstruction:
    'Build an Enterprise Logistics Hub workspace using LogisticsWorkspace.tsx with live shipment records, operational KPI metrics, status filter tabs, search, CSV export, new shipment creation, and a selectable shipment detail panel.',
  customFields: [
    {
      key: 'workspaceTitle',
      label: 'Workspace Title',
      defaultValue: 'Freight & Customs Dispatch',
      placeholder: 'Control tower title',
    },
    {
      key: 'breadcrumbs',
      label: 'Breadcrumb Path',
      defaultValue: 'Operations / Global Freight / Control Tower',
      placeholder: 'Org / Division / Workspace',
    },
    {
      key: 'searchPlaceholder',
      label: 'Search Placeholder',
      defaultValue: 'Search tracking ID, lane, carrier, or vessel...',
      placeholder: 'Search input placeholder',
    },
    {
      key: 'newShipmentLabel',
      label: 'Primary Action',
      defaultValue: 'New Shipment',
      placeholder: 'Primary CTA button',
    },
    {
      key: 'exportCsvLabel',
      label: 'Export Action',
      defaultValue: 'Export CSV',
      placeholder: 'Secondary button label',
    },
  ],
  design: {
    id: 'enterprise-utility-light',
    version: '1.0.0',
    mode: 'light',
    summary:
      'High-density enterprise freight control tower built on a pure #FFFFFF workspace with a #F1F5F9 top utility bar, #E2E8F0 crisp dividers, #2563EB royal blue actions, and monospace tracking identifiers.',
    palette: {
      canvas: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceElevated: '#F1F5F9',
      text: '#0F172A',
      textMuted: '#64748B',
      border: '#E2E8F0',
      accent: '#2563EB',
      accentForeground: '#FFFFFF',
      semantic: {
        success: '#047857',
        warning: '#92400E',
        danger: '#BE123C',
        info: '#1D4ED8',
      },
    },
    typography: {
      display: 'System Sans (font-sans font-semibold tracking-tight text-slate-900)',
      body: 'System Sans (font-sans text-xs to text-sm text-slate-700)',
      mono: 'Monospace (font-mono tabular-nums) for tracking IDs, UNLOCODE/IATA route codes, KPI values, weights, ETAs, and timestamps',
      headingScale:
        'Workspace title: text-base sm:text-lg font-semibold tracking-tight; KPI metric: font-mono text-2xl font-semibold tabular-nums; Detail title: font-mono text-sm font-semibold',
      bodyScale:
        'Controls/inputs: text-xs to text-sm; dense table/detail rows: text-xs; micro labels/timestamps: text-[10px]–text-[11px]',
    },
    geometry: {
      radius:
        'Panels/Cards: rounded-lg; Inputs/Buttons/Tabs: rounded-md; Micro tags/mode icons: rounded; Status pills/dots: rounded-full',
      borderStyle:
        '1px crisp Slate-200 borders (border-[#E2E8F0], divide-y divide-[#E2E8F0], 1px gap-px specs grid) with 2px left active row indicator (border-l-2 border-l-[#2563EB])',
      spacing:
        'Compact operational density: header px-4 py-3 sm:px-6, main space-y-5 px-4 py-5 sm:px-6, KPI cards p-4, 8/4 split (lg:col-span-8 table / lg:col-span-4 inspector)',
      containerMaxWidth: 'max-w-[1440px]',
    },
    elevation:
      'Flat high-clarity enterprise utility surfaces separated by 1px #E2E8F0 borders and subtle #F1F5F9 / #F8FAFC surface contrast; minimal shadow-2xs on buttons',
    motion:
      'Crisp transition-colors on table rows, filter tabs, export/copy feedback states, and inline registration drawer toggle',
    components: [
      'TopUtilityBar (bg-[#F1F5F9] header with breadcrumbs, live record count pill, search input, CSV export, and New Shipment trigger)',
      'KpiStrip (4-column operational KPI cards with monospace values and delta badges)',
      'ShipmentTable (status-tabbed All/Delivered/In Transit/Customs ledger with left-accent selected row highlight)',
      'ShipmentDetailPanel (4-column inspector with copyable tracking ID, origin-to-destination lane visual, 2x2 specs grid, and milestone timeline)',
      'NewShipmentDrawer (inline collapsible form for registering freight consignments)',
    ],
    doRules: [
      'Maintain pure #FFFFFF workspace panels paired with #F1F5F9 utility header and #F8FAFC table/card headers.',
      'Render tracking IDs, route codes (e.g. SIN -> RTM), weights, ETAs, and KPI metrics in font-mono tabular-nums.',
      'Use #2563EB exclusively for primary CTA buttons, active filter tabs, active timeline nodes, and the selected table row left border.',
      'Keep padding tight (p-3 to p-4, text-xs table rows) to preserve high-density control tower scannability.',
    ],
    dontRules: [
      'Do not add dark-mode panels, decorative gradients, or glassmorphism.',
      'Do not inflate card corner radii beyond rounded-lg or add heavy drop shadows.',
      'Do not omit monospace formatting on logistics codes, timestamps, and quantities.',
      'Do not replace status semantic colors (emerald Delivered, blue In Transit, amber Customs) with generic grays.',
    ],
  },
};
