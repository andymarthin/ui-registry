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
};
