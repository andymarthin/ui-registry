import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Bell, CheckCheck, Menu, Search, X } from 'lucide-react';
import type { DashboardTimeframe, NotificationItem } from '../types';

const TIMEFRAMES: DashboardTimeframe[] = ['7D', '30D', '90D'];

export interface DashboardHeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  userName: string;
  userRole: string;
  userInitials: string;
  timeframe: DashboardTimeframe;
  searchQuery: string;
  notifications: NotificationItem[];
  onOpenMobileMenu: () => void;
  onTimeframeChange: (timeframe: DashboardTimeframe) => void;
  onSearchChange: (query: string) => void;
  onMarkAllRead: () => void;
}

export function DashboardHeader({
  pageTitle,
  pageSubtitle,
  userName,
  userRole,
  userInitials,
  timeframe,
  searchQuery,
  notifications,
  onOpenMobileMenu,
  onTimeframeChange,
  onSearchChange,
  onMarkAllRead,
}: DashboardHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!notificationsOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        event.target instanceof Node &&
        !popoverRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  return (
    <header
      data-inspect-label="DashboardHeader"
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {pageTitle}
          </h1>
          <p className="hidden truncate text-sm text-slate-500 sm:block">
            {pageSubtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div ref={popoverRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Notifications
                  </p>
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                  >
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Mark all read
                  </button>
                </div>
                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {notifications.map((item) => (
                    <li
                      key={item.id}
                      className={`flex gap-3 px-4 py-3 ${item.unread ? 'bg-blue-50/50' : ''}`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          item.unread ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.timeAgo}
                        </p>
                      </div>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-slate-500">
                      You&apos;re all caught up.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1 pl-1 pr-1 sm:pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
              {userInitials}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-xs font-semibold leading-tight text-slate-900">
                {userName}
              </span>
              <span className="block truncate text-[11px] leading-tight text-slate-500">
                {userRole}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-2.5 sm:px-6">
        <label className="relative min-w-0 flex-1 basis-48">
          <span className="sr-only">Search dashboard</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search orders, customers, invoices…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </label>

        <div
          role="group"
          aria-label="Timeframe"
          className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-0.5"
        >
          {TIMEFRAMES.map((option) => {
            const active = option === timeframe;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onTimeframeChange(option)}
                aria-pressed={active}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
