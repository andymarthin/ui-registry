export type DashboardTimeframe = '7D' | '30D' | '90D';

export type NavSectionId =
  | 'overview'
  | 'analytics'
  | 'orders'
  | 'customers'
  | 'billing'
  | 'settings';

export interface NavItem {
  id: NavSectionId;
  label: string;
  group: 'Workspace' | 'Operations';
  badge?: string;
}

export interface KpiStat {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  sublabel: string;
  sparkline: number[];
  icon: 'revenue' | 'orders' | 'customers' | 'conversion';
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  expenses: number;
  formattedRevenue: string;
  formattedExpenses: string;
  ordersCount: number;
}

export interface ChannelShare {
  id: string;
  name: string;
  sharePercent: number;
  revenue: string;
  growth: string;
}

export type OrderStatus = 'paid' | 'pending' | 'processing' | 'refunded';

export interface OrderRecord {
  id: string;
  customer: string;
  company: string;
  email: string;
  plan: string;
  amount: number;
  formattedAmount: string;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
  region: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  actorInitials: string;
  action: string;
  target: string;
  timeAgo: string;
  category: 'billing' | 'team' | 'system' | 'security';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
}

export interface TimeframeDashboardData {
  timeframeLabel: string;
  kpis: KpiStat[];
  revenueSeries: RevenuePoint[];
  channels: ChannelShare[];
}

export interface AdminDashboardProps {
  brandName: string;
  workspaceLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  userName: string;
  userRole: string;
  userInitials: string;
  navItems: NavItem[];
  defaultTimeframe?: DashboardTimeframe;
  datasets: Record<DashboardTimeframe, TimeframeDashboardData>;
  orders: OrderRecord[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
}
