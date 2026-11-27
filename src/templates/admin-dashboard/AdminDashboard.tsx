import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, Filter, Info, X } from 'lucide-react';
import { DashboardSidebar } from './layout/DashboardSidebar';
import { DashboardHeader } from './layout/DashboardHeader';
import { KpiCardsRow } from './widgets/KpiCardsRow';
import { RevenueChartCard } from './widgets/RevenueChartCard';
import { ActivityFeedCard } from './widgets/ActivityFeedCard';
import { OrdersTableCard } from './tables/OrdersTableCard';
import type {
  AdminDashboardProps,
  DashboardTimeframe,
  NavSectionId,
  OrderRecord,
} from './types';

export * from './types';

const SECTION_COPY: Record<
  NavSectionId,
  { title: string; description: string }
> = {
  overview: {
    title: 'Overview',
    description:
      'Full workspace snapshot: KPIs, revenue trend, team activity, and recent orders.',
  },
  analytics: {
    title: 'Analytics focus',
    description:
      'Showing performance indicators and revenue trends with channel mix first.',
  },
  orders: {
    title: 'Orders focus',
    description:
      'Order queue promoted to the top with a compact KPI summary below it.',
  },
  customers: {
    title: 'Customers focus',
    description:
      'Accounts derived from recent orders, ranked by total billed value.',
  },
  billing: {
    title: 'Billing focus',
    description:
      'Collections, pending receivables, and refunds across recent orders.',
  },
  settings: {
    title: 'Workspace settings',
    description:
      'Manage dashboard preferences and notification behavior for this workspace.',
  },
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

interface CustomerSummary {
  key: string;
  customer: string;
  company: string;
  email: string;
  region: string;
  plan: string;
  orders: number;
  total: number;
}

function summarizeCustomers(orders: OrderRecord[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();
  for (const order of orders) {
    const existing = map.get(order.email);
    if (existing) {
      existing.orders += 1;
      if (order.status !== 'refunded') existing.total += order.amount;
    } else {
      map.set(order.email, {
        key: order.email,
        customer: order.customer,
        company: order.company,
        email: order.email,
        region: order.region,
        plan: order.plan,
        orders: 1,
        total: order.status === 'refunded' ? 0 : order.amount,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function AdminDashboard({
  brandName,
  workspaceLabel,
  pageTitle,
  pageSubtitle,
  userName,
  userRole,
  userInitials,
  navItems,
  defaultTimeframe,
  datasets,
  orders,
  activities,
  notifications,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavSectionId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<DashboardTimeframe>(
    defaultTimeframe ?? '30D',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsState, setNotificationsState] = useState(notifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [compactTables, setCompactTables] = useState(false);

  useEffect(() => {
    setNotificationsState(notifications);
  }, [notifications]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const data = datasets[timeframe];
  const section = SECTION_COPY[activeSection];
  const activeNav = navItems.find((item) => item.id === activeSection);

  const customers = useMemo(() => {
    const all = summarizeCustomers(orders);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) =>
      [c.customer, c.company, c.email, c.region, c.plan]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [orders, searchQuery]);

  const billing = useMemo(() => {
    const sum = (status: OrderRecord['status']) =>
      orders
        .filter((o) => o.status === status)
        .reduce((acc, o) => acc + o.amount, 0);
    return {
      collected: sum('paid'),
      pending: sum('pending') + sum('processing'),
      refunded: sum('refunded'),
    };
  }, [orders]);

  const selectSection = (id: NavSectionId) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const handleQuickAction = (actionLabel: string) => {
    setToastMessage(`${actionLabel} — queued for ${workspaceLabel}.`);
  };

  const markAllRead = () =>
    setNotificationsState((items) =>
      items.map((item) => ({ ...item, unread: false })),
    );

  const kpis = (
    <KpiCardsRow kpis={data.kpis} timeframeLabel={data.timeframeLabel} />
  );
  const chart = (
    <RevenueChartCard
      timeframeLabel={data.timeframeLabel}
      series={data.revenueSeries}
      channels={data.channels}
    />
  );
  const feed = (
    <ActivityFeedCard
      activities={activities}
      onQuickAction={handleQuickAction}
    />
  );
  const table = (
    <OrdersTableCard orders={orders} externalSearchQuery={searchQuery} />
  );

  const chartAndFeed = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="min-w-0 xl:col-span-8">{chart}</div>
      <div className="min-w-0 xl:col-span-4">{feed}</div>
    </div>
  );

  let content: ReactNode;
  switch (activeSection) {
    case 'analytics':
      content = (
        <>
          {kpis}
          {chart}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-5">{feed}</div>
            <div className="min-w-0 xl:col-span-7">{table}</div>
          </div>
        </>
      );
      break;
    case 'orders':
      content = (
        <>
          {table}
          {kpis}
          {chartAndFeed}
        </>
      );
      break;
    case 'customers':
      content = (
        <>
          <section
            data-inspect-label="CustomersDirectory"
            className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Top accounts
              </h2>
              <p className="text-sm text-slate-500">
                {customers.length} account{customers.length === 1 ? '' : 's'}{' '}
                from recent orders
              </p>
            </div>
            {customers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No customers match &ldquo;{searchQuery}&rdquo;.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-px bg-slate-100 md:grid-cols-2 2xl:grid-cols-3">
                {customers.map((c) => (
                  <li
                    key={c.key}
                    className="flex min-w-0 items-center gap-3 bg-white px-5 py-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                      {initialsOf(c.customer)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {c.customer}
                        <span className="font-normal text-slate-500">
                          {' '}
                          · {c.company}
                        </span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {c.email} · {c.region}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-slate-900">
                        {formatCurrency(c.total)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.orders} order{c.orders === 1 ? '' : 's'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-4">{feed}</div>
            <div className="min-w-0 xl:col-span-8">{table}</div>
          </div>
        </>
      );
      break;
    case 'billing':
      content = (
        <>
          <section
            data-inspect-label="BillingSummary"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              {
                label: 'Collected',
                value: billing.collected,
                tone: 'text-slate-900',
                hint: 'Paid invoices',
              },
              {
                label: 'Outstanding',
                value: billing.pending,
                tone: 'text-blue-700',
                hint: 'Pending + processing',
              },
              {
                label: 'Refunded',
                value: billing.refunded,
                tone: 'text-slate-900',
                hint: 'Returned to customers',
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {tile.label}
                </p>
                <p
                  className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${tile.tone}`}
                >
                  {formatCurrency(tile.value)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{tile.hint}</p>
              </div>
            ))}
          </section>
          {table}
          {chart}
        </>
      );
      break;
    case 'settings':
      content = (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section
            data-inspect-label="WorkspaceSettings"
            className="min-w-0 rounded-xl border border-slate-200 bg-white px-5 shadow-sm xl:col-span-7"
          >
            <div className="border-b border-slate-100 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Dashboard preferences
              </h2>
              <p className="text-sm text-slate-500">
                Applies to {workspaceLabel} for {userName}.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              <SettingToggle
                label="Weekly email digest"
                description="Receive a Monday summary of revenue, orders, and churn signals."
                checked={digestEnabled}
                onChange={setDigestEnabled}
              />
              <SettingToggle
                label="Billing alerts"
                description="Notify admins when payments fail or refunds exceed thresholds."
                checked={alertsEnabled}
                onChange={setAlertsEnabled}
              />
              <SettingToggle
                label="Compact tables"
                description="Reduce row spacing in data tables for dense review sessions."
                checked={compactTables}
                onChange={setCompactTables}
              />
            </div>
          </section>
          <div className="min-w-0 xl:col-span-5">{feed}</div>
        </div>
      );
      break;
    case 'overview':
    default:
      content = (
        <>
          {kpis}
          {chartAndFeed}
          {table}
        </>
      );
  }

  return (
    <div
      data-inspect-label="AdminDashboard"
      className="relative flex min-h-[780px] w-full overflow-x-clip bg-slate-50 text-slate-900"
    >
      <DashboardSidebar
        brandName={brandName}
        workspaceLabel={workspaceLabel}
        navItems={navItems}
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onSelectSection={selectSection}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          userName={userName}
          userRole={userRole}
          userInitials={userInitials}
          timeframe={timeframe}
          searchQuery={searchQuery}
          notifications={notificationsState}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onTimeframeChange={setTimeframe}
          onSearchChange={setSearchQuery}
          onMarkAllRead={markAllRead}
        />

        <main
          data-inspect-label="DashboardContent"
          className="min-w-0 flex-1 space-y-6 px-4 py-6 sm:px-6"
        >
          {toastMessage && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1">{toastMessage}</p>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                aria-label="Dismiss message"
                className="shrink-0 rounded text-blue-500 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {activeSection !== 'overview' && (
            <div
              data-inspect-label="SectionBanner"
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <Filter className="h-3 w-3" aria-hidden="true" />
                {activeNav?.label ?? section.title}
              </span>
              <p className="flex min-w-0 flex-1 basis-56 items-start gap-2 text-sm text-slate-600">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="font-medium text-slate-900">
                    {section.title}.
                  </span>{' '}
                  {section.description}
                </span>
              </p>
              <button
                type="button"
                onClick={() => selectSection('overview')}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Clear focus
              </button>
            </div>
          )}

          {content}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
