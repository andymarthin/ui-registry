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
  dependencies: ['lucide-react'],
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
};
