import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import type { OrderRecord, OrderStatus } from '../types';

export interface OrdersTableCardProps {
  orders: OrderRecord[];
  externalSearchQuery?: string;
}

type StatusFilter = 'all' | OrderStatus;
type SortKey = 'id' | 'customer' | 'amount' | 'date';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 5;

const FILTERS: StatusFilter[] = ['all', 'paid', 'processing', 'pending', 'refunded'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  processing: 'bg-blue-50 text-blue-700 ring-blue-200/70',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  refunded: 'bg-rose-50 text-rose-700 ring-rose-200/70',
};

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'id', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'date', label: 'Date' },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function compareDates(a: string, b: string) {
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb;
  return a.localeCompare(b);
}

export function OrdersTableCard({ orders, externalSearchQuery }: OrdersTableCardProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const closeRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  const searched = useMemo(() => {
    const terms = [externalSearchQuery ?? '', query]
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (terms.length === 0) return orders;
    return orders.filter((o) => {
      const hay = [o.id, o.customer, o.company, o.email, o.plan, o.status, o.region, o.paymentMethod]
        .join(' ')
        .toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [orders, externalSearchQuery, query]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: searched.length,
      paid: 0,
      processing: 0,
      pending: 0,
      refunded: 0,
    };
    for (const o of searched) c[o.status] += 1;
    return c;
  }, [searched]);

  const rows = useMemo(() => {
    const filtered = status === 'all' ? searched : searched.filter((o) => o.status === status);
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'date':
          return compareDates(a.date, b.date) * dir;
        case 'customer':
          return a.customer.localeCompare(b.customer) * dir;
        default:
          return a.id.localeCompare(b.id, undefined, { numeric: true }) * dir;
      }
    });
  }, [searched, status, sortKey, sortDir]);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIdx, startIdx + PAGE_SIZE);
  const from = total === 0 ? 0 : startIdx + 1;
  const to = Math.min(total, startIdx + PAGE_SIZE);

  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setSelectedId(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      returnFocusRef.current?.focus();
    };
  }, [selected]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'customer' || key === 'id' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const openOrder = (id: string, el: HTMLElement) => {
    returnFocusRef.current = el;
    setSelectedId(id);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const detailRows: [string, string][] = selected
    ? [
        ['Customer', selected.customer],
        ['Company', selected.company],
        ['Email', selected.email],
        ['Plan', selected.plan],
        ['Payment method', selected.paymentMethod],
        ['Region', selected.region],
        ['Date', selected.date],
      ]
    : [];

  return (
    <section
      data-inspect-label="OrdersTableCard"
      aria-label="Recent orders"
      className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200/90 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search orders</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={onSearchChange}
              placeholder="Search orders, customers…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-2 focus:outline-blue-200"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={status === f}
              onClick={() => {
                setStatus(f);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 ${
                status === f
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
              <span
                className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                  status === f ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {COLUMNS.map((col) => {
                const active = sortKey === col.key;
                const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`px-5 py-3 font-medium ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-500 ${
                        active ? 'text-blue-700' : ''
                      }`}
                    >
                      {col.label}
                      <Icon className="size-3.5" aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-5 py-3 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  No orders match your filters.
                </td>
              </tr>
            ) : (
              pageRows.map((o) => (
                <tr
                  key={o.id}
                  tabIndex={0}
                  aria-label={`Open order ${o.id}`}
                  onClick={(e) => openOrder(o.id, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openOrder(o.id, e.currentTarget);
                    }
                  }}
                  className={`cursor-pointer outline-none transition-colors hover:bg-blue-50/50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 ${
                    selectedId === o.id ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900 tabular-nums">
                    {o.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="max-w-48 truncate font-medium text-slate-900">{o.customer}</p>
                    <p className="max-w-48 truncate text-xs text-slate-500">{o.company}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                    {o.formattedAmount}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-500 tabular-nums">
                    {o.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200/90 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500 tabular-nums" aria-live="polite">
          Showing {from}–{to} of {total}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Prev
          </button>
          <span className="text-xs text-slate-500 tabular-nums">
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage >= pageCount}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 z-10 flex justify-end">
          <button
            type="button"
            aria-label="Close order details"
            tabIndex={-1}
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 cursor-default bg-slate-900/20"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-slate-200/90 bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/90 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order detail
                </p>
                <h3
                  id="order-detail-title"
                  className="truncate text-lg font-semibold text-slate-900 tabular-nums"
                >
                  {selected.id}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close order details"
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between rounded-lg border border-slate-200/90 bg-slate-50/70 p-4">
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {selected.formattedAmount}
                  </p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <dl className="divide-y divide-slate-100 text-sm">
                {detailRows.map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="shrink-0 text-slate-500">{k}</dt>
                    <dd className="min-w-0 break-words text-right font-medium text-slate-900">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
