import type { TemplatePreviewProps } from '../types';
import {
  AdminDashboard,
  type ActivityItem,
  type ChannelShare,
  type DashboardTimeframe,
  type KpiStat,
  type NavItem,
  type NotificationItem,
  type OrderRecord,
  type RevenuePoint,
  type TimeframeDashboardData,
} from './AdminDashboard';

const usd = (value: number) =>
  `$${Math.round(value).toLocaleString('en-US')}`;

const compactUsd = (value: number) =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${(value / 1000).toFixed(1)}k`;

function buildSeries(
  labels: string[],
  baseRevenue: number,
  wave: number[],
): RevenuePoint[] {
  return labels.map((label, i) => {
    const revenue = Math.round(baseRevenue * wave[i % wave.length]);
    const expenses = Math.round(revenue * (0.52 + ((i * 7) % 5) * 0.015));
    return {
      label,
      revenue,
      expenses,
      formattedRevenue: usd(revenue),
      formattedExpenses: usd(expenses),
      ordersCount: Math.round(revenue / 410),
    };
  });
}

const SERIES_7D = buildSeries(
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  14200,
  [0.92, 1.04, 1.12, 1.0, 1.18, 0.74, 0.81],
);
const SERIES_30D = buildSeries(
  ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8', 'Wk 9', 'Wk 10'],
  38400,
  [0.84, 0.9, 0.97, 0.93, 1.05, 1.12, 1.08, 1.17, 1.22, 1.3],
);
const SERIES_90D = buildSeries(
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  142000,
  [0.8, 0.84, 0.9, 0.88, 0.97, 1.03, 1.0, 1.09, 1.14, 1.12, 1.21, 1.32],
);

const channels = (
  shares: [number, string, string][],
): ChannelShare[] => {
  const names = ['Direct Sales', 'Self-serve', 'Partners', 'Marketplace'];
  return shares.map(([sharePercent, revenue, growth], i) => ({
    id: `ch-${i}`,
    name: names[i],
    sharePercent,
    revenue,
    growth,
  }));
};

const kpis = (
  values: [string, string, string, string],
  deltas: [string, string, string, string],
  positives: [boolean, boolean, boolean, boolean],
  period: string,
  sparks: number[][],
): KpiStat[] => [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: values[0],
    delta: deltas[0],
    positive: positives[0],
    sublabel: `vs. previous ${period}`,
    sparkline: sparks[0],
    icon: 'revenue',
  },
  {
    id: 'orders',
    label: 'Orders',
    value: values[1],
    delta: deltas[1],
    positive: positives[1],
    sublabel: `vs. previous ${period}`,
    sparkline: sparks[1],
    icon: 'orders',
  },
  {
    id: 'customers',
    label: 'Active Customers',
    value: values[2],
    delta: deltas[2],
    positive: positives[2],
    sublabel: 'Net of churned accounts',
    sparkline: sparks[2],
    icon: 'customers',
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: values[3],
    delta: deltas[3],
    positive: positives[3],
    sublabel: 'Trial to paid',
    sparkline: sparks[3],
    icon: 'conversion',
  },
];

const DATASETS: Record<DashboardTimeframe, TimeframeDashboardData> = {
  '7D': {
    timeframeLabel: 'Last 7 days',
    kpis: kpis(
      [compactUsd(98400), '241', '3,184', '4.1%'],
      ['+6.2%', '+3.4%', '+1.1%', '-0.3%'],
      [true, true, true, false],
      '7 days',
      [
        [12, 14, 13, 16, 18, 15, 17],
        [30, 34, 33, 36, 35, 38, 37],
        [3100, 3120, 3140, 3150, 3160, 3175, 3184],
        [4.4, 4.3, 4.4, 4.2, 4.1, 4.2, 4.1],
      ],
    ),
    revenueSeries: SERIES_7D,
    channels: channels([
      [38, '$37.4k', '+5.1%'],
      [29, '$28.5k', '+8.7%'],
      [21, '$20.7k', '+2.3%'],
      [12, '$11.8k', '-1.4%'],
    ]),
  },
  '30D': {
    timeframeLabel: 'Last 30 days',
    kpis: kpis(
      [compactUsd(428600), '1,046', '3,184', '4.8%'],
      ['+12.4%', '+8.9%', '+4.6%', '+0.6%'],
      [true, true, true, true],
      '30 days',
      [
        [20, 24, 23, 28, 27, 33, 36, 40],
        [90, 96, 94, 104, 110, 108, 118, 124],
        [2800, 2880, 2940, 3010, 3070, 3120, 3150, 3184],
        [4.0, 4.1, 4.3, 4.2, 4.5, 4.6, 4.7, 4.8],
      ],
    ),
    revenueSeries: SERIES_30D,
    channels: channels([
      [41, '$175.7k', '+9.8%'],
      [27, '$115.7k', '+14.2%'],
      [20, '$85.7k', '+3.5%'],
      [12, '$51.4k', '-2.1%'],
    ]),
  },
  '90D': {
    timeframeLabel: 'Last 90 days',
    kpis: kpis(
      [compactUsd(1_284_300), '3,208', '3,184', '4.6%'],
      ['+18.7%', '+14.1%', '+9.3%', '+0.9%'],
      [true, true, true, true],
      '90 days',
      [
        [60, 64, 70, 68, 78, 84, 88, 96],
        [280, 290, 301, 296, 322, 340, 356, 372],
        [2500, 2610, 2700, 2820, 2920, 3020, 3100, 3184],
        [3.7, 3.9, 4.0, 4.2, 4.3, 4.4, 4.5, 4.6],
      ],
    ),
    revenueSeries: SERIES_90D,
    channels: channels([
      [43, '$552.2k', '+13.3%'],
      [25, '$321.1k', '+19.0%'],
      [21, '$269.7k', '+6.8%'],
      [11, '$141.3k', '+0.9%'],
    ]),
  },
};

const order = (
  id: string,
  customer: string,
  company: string,
  plan: string,
  amount: number,
  status: OrderRecord['status'],
  date: string,
  paymentMethod: string,
  region: string,
): OrderRecord => ({
  id,
  customer,
  company,
  email: `${customer.split(' ')[0].toLowerCase()}@${company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')}.com`,
  plan,
  amount,
  formattedAmount: usd(amount),
  status,
  date,
  paymentMethod,
  region,
});

const ORDERS: OrderRecord[] = [
  order('ORD-48201', 'Amara Okafor', 'Northwind Labs', 'Enterprise Annual', 24800, 'paid', 'Nov 26, 2026', 'Wire transfer', 'EMEA'),
  order('ORD-48200', 'Daniel Reyes', 'Brightline Health', 'Business Annual', 9600, 'processing', 'Nov 26, 2026', 'Visa •••• 4242', 'North America'),
  order('ORD-48199', 'Mei Tanaka', 'Kumo Robotics', 'Enterprise Monthly', 3200, 'paid', 'Nov 25, 2026', 'ACH debit', 'APAC'),
  order('ORD-48198', 'Lukas Weber', 'Alpenrose Retail', 'Business Monthly', 1450, 'pending', 'Nov 25, 2026', 'SEPA debit', 'EMEA'),
  order('ORD-48197', 'Priya Nair', 'Lumen Fintech', 'Enterprise Annual', 31200, 'paid', 'Nov 24, 2026', 'Wire transfer', 'APAC'),
  order('ORD-48196', 'Carlos Mendez', 'Sol Logistics', 'Team Annual', 4800, 'refunded', 'Nov 24, 2026', 'Mastercard •••• 8821', 'LATAM'),
  order('ORD-48195', 'Hannah Brooks', 'Harbor & Pine', 'Business Annual', 9600, 'paid', 'Nov 23, 2026', 'Visa •••• 1190', 'North America'),
  order('ORD-48194', 'Omar Haddad', 'Cedar Analytics', 'Team Monthly', 620, 'pending', 'Nov 23, 2026', 'Amex •••• 3005', 'EMEA'),
  order('ORD-48193', 'Sofia Rossi', 'Terra Foods', 'Business Monthly', 1450, 'processing', 'Nov 22, 2026', 'SEPA debit', 'EMEA'),
  order('ORD-48192', 'Ethan Clarke', 'Vantage Media', 'Enterprise Monthly', 3200, 'paid', 'Nov 22, 2026', 'ACH debit', 'North America'),
  order('ORD-48191', 'Yuna Park', 'Orbit Games', 'Team Annual', 4800, 'paid', 'Nov 21, 2026', 'Visa •••• 7714', 'APAC'),
  order('ORD-48190', 'Amara Okafor', 'Northwind Labs', 'Add-on: Advanced SSO', 1800, 'refunded', 'Nov 20, 2026', 'Wire transfer', 'EMEA'),
];

const ACTIVITIES: ActivityItem[] = [
  { id: 'act-1', actor: 'Amara Okafor', actorInitials: 'AO', action: 'upgraded the plan to', target: 'Enterprise Annual', timeAgo: '12 min ago', category: 'billing' },
  { id: 'act-2', actor: 'Jordan Ellis', actorInitials: 'JE', action: 'invited 4 teammates to', target: 'Revenue Ops', timeAgo: '38 min ago', category: 'team' },
  { id: 'act-3', actor: 'Billing Engine', actorInitials: 'BE', action: 'retried failed payment for', target: 'Alpenrose Retail', timeAgo: '1 hr ago', category: 'system' },
  { id: 'act-4', actor: 'Priya Nair', actorInitials: 'PN', action: 'rotated API keys for', target: 'Lumen Fintech', timeAgo: '2 hr ago', category: 'security' },
  { id: 'act-5', actor: 'Carlos Mendez', actorInitials: 'CM', action: 'requested a refund on', target: 'ORD-48196', timeAgo: '3 hr ago', category: 'billing' },
  { id: 'act-6', actor: 'Jordan Ellis', actorInitials: 'JE', action: 'changed role permissions in', target: 'Finance Admin', timeAgo: 'Yesterday', category: 'security' },
];

const NOTIFICATIONS: NotificationItem[] = [
  { id: 'note-1', title: 'Payment failed', description: 'Alpenrose Retail card was declined for ORD-48198.', timeAgo: '8 min ago', unread: true },
  { id: 'note-2', title: 'Refund approved', description: 'ORD-48196 refund of $4,800 was issued to Sol Logistics.', timeAgo: '1 hr ago', unread: true },
  { id: 'note-3', title: 'Revenue milestone', description: 'Monthly recurring revenue crossed $400k for the first time.', timeAgo: '5 hr ago', unread: true },
  { id: 'note-4', title: 'Weekly digest ready', description: 'Your operations summary for last week is available.', timeAgo: 'Yesterday', unread: false },
];

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', group: 'Workspace' },
  { id: 'analytics', label: 'Analytics', group: 'Workspace' },
  { id: 'orders', label: 'Orders', group: 'Operations', badge: '12' },
  { id: 'customers', label: 'Customers', group: 'Operations' },
  { id: 'billing', label: 'Billing', group: 'Operations', badge: '3' },
  { id: 'settings', label: 'Settings', group: 'Workspace' },
];

export default function Preview({ inspect, customization }: TemplatePreviewProps) {
  const copy = customization?.copy ?? {};

  return (
    <div data-inspect-mode={inspect ? 'true' : 'false'}>
      <AdminDashboard
        brandName={copy.brandName || 'Meridian Cloud'}
        workspaceLabel={copy.workspaceLabel || 'Enterprise Workspace'}
        pageTitle={copy.pageTitle || 'Executive Overview'}
        pageSubtitle={
          copy.pageSubtitle ||
          'Revenue performance, order velocity, and team operations across active billing cycles.'
        }
        userName="Jordan Ellis"
        userRole="Finance Admin"
        userInitials="JE"
        navItems={NAV_ITEMS}
        defaultTimeframe="30D"
        datasets={DATASETS}
        orders={ORDERS}
        activities={ACTIVITIES}
        notifications={NOTIFICATIONS}
      />
    </div>
  );
}
