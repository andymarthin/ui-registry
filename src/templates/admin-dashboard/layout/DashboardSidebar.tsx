import {
  BarChart3,
  CreditCard,
  Hexagon,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingCart,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { NavItem, NavSectionId } from '../types';

const NAV_ICONS: Record<NavSectionId, LucideIcon> = {
  overview: LayoutDashboard,
  analytics: BarChart3,
  orders: ShoppingCart,
  customers: Users,
  billing: CreditCard,
  settings: Settings,
};

const GROUP_ORDER: NavItem['group'][] = ['Workspace', 'Operations'];

export interface DashboardSidebarProps {
  brandName: string;
  workspaceLabel: string;
  navItems: NavItem[];
  activeSection: NavSectionId;
  collapsed: boolean;
  mobileOpen: boolean;
  onSelectSection: (id: NavSectionId) => void;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

interface NavListProps {
  navItems: NavItem[];
  activeSection: NavSectionId;
  compact: boolean;
  onSelectSection: (id: NavSectionId) => void;
}

function NavList({
  navItems,
  activeSection,
  compact,
  onSelectSection,
}: NavListProps) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Primary">
      {GROUP_ORDER.map((group) => {
        const items = navItems.filter((item) => item.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            {compact ? (
              <div className="mx-2 mb-2 h-px bg-slate-200" aria-hidden="true" />
            ) : (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group}
              </p>
            )}
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = NAV_ICONS[item.id];
                const active = item.id === activeSection;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectSection(item.id)}
                      title={compact ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        compact ? 'justify-center px-0' : 'px-3'
                      } ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                        aria-hidden="true"
                      />
                      {!compact && (
                        <span className="min-w-0 flex-1 truncate text-left">
                          {item.label}
                        </span>
                      )}
                      {item.badge &&
                        (compact ? (
                          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                        ) : (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              active
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ))}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function UsageCard({ workspaceLabel }: { workspaceLabel: string }) {
  return (
    <div className="m-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
      <p className="truncate text-xs font-semibold text-blue-900">
        {workspaceLabel}
      </p>
      <p className="mt-0.5 text-[11px] text-blue-700">
        7,420 of 10,000 seats &amp; API calls used
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full w-[74%] rounded-full bg-blue-600" />
      </div>
      <button
        type="button"
        className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Upgrade plan
      </button>
    </div>
  );
}

function BrandEmblem({ brandName }: { brandName: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
        <Hexagon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="truncate text-sm font-semibold tracking-tight text-slate-900">
        {brandName}
      </span>
    </div>
  );
}

export function DashboardSidebar({
  brandName,
  workspaceLabel,
  navItems,
  activeSection,
  collapsed,
  mobileOpen,
  onSelectSection,
  onToggleCollapsed,
  onCloseMobile,
}: DashboardSidebarProps) {
  return (
    <div data-inspect-label="DashboardSidebar" className="contents">
      {/* Desktop rail */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${
            collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4'
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <>
              <BrandEmblem brandName={brandName} />
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Collapse sidebar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        <NavList
          navItems={navItems}
          activeSection={activeSection}
          compact={collapsed}
          onSelectSection={onSelectSection}
        />
        {!collapsed && <UsageCard workspaceLabel={workspaceLabel} />}
      </aside>

      {/* Mobile slide-over drawer (absolute so inline previews stay contained) */}
      {mobileOpen && (
        <div
          className="absolute inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onCloseMobile}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-900/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4">
              <BrandEmblem brandName={brandName} />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <NavList
              navItems={navItems}
              activeSection={activeSection}
              compact={false}
              onSelectSection={onSelectSection}
            />
            <UsageCard workspaceLabel={workspaceLabel} />
          </aside>
        </div>
      )}
    </div>
  );
}
