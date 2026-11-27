import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ChannelShare, RevenuePoint } from '../types';

export interface RevenueChartCardProps {
  timeframeLabel: string;
  series: RevenuePoint[];
  channels: ChannelShare[];
}

type ViewMode = 'compare' | 'revenue';

const W = 640;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const CHANNEL_BARS = ['bg-blue-600', 'bg-blue-500', 'bg-blue-400', 'bg-slate-400'];

function compact(n: number) {
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `$${Math.round(n)}`;
}

function niceMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const n = value / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export function RevenueChartCard({ timeframeLabel, series, channels }: RevenueChartCardProps) {
  const [mode, setMode] = useState<ViewMode>('compare');
  const [selected, setSelected] = useState<number | null>(null);

  const count = series.length;
  const activeIndex =
    count === 0 ? -1 : selected !== null && selected < count ? selected : count - 1;
  const active = activeIndex >= 0 ? series[activeIndex] : null;

  useEffect(() => {
    if (selected !== null && selected >= count) setSelected(null);
  }, [count, selected]);

  const values = series.flatMap((p) => [
    Number.isFinite(p.revenue) ? p.revenue : 0,
    mode === 'compare' && Number.isFinite(p.expenses) ? p.expenses : 0,
  ]);
  const maxY = niceMax(Math.max(0, ...values));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxY);

  const slot = count > 0 ? PLOT_W / count : PLOT_W;
  const barW = Math.max(4, Math.min(36, slot * 0.55));
  const xCenter = (i: number) => PAD.left + slot * i + slot / 2;
  const yFor = (v: number) =>
    PAD.top + PLOT_H - ((Number.isFinite(v) ? Math.max(0, v) : 0) / maxY) * PLOT_H;

  const expensePath = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xCenter(i).toFixed(2)} ${yFor(p.expenses).toFixed(2)}`)
    .join(' ');

  const labelEvery = Math.max(1, Math.ceil(count / 8));
  const margin = active && active.revenue > 0 ? ((active.revenue - active.expenses) / active.revenue) * 100 : null;

  const selectBy = (i: number) => setSelected(i);

  const onKey = (e: React.KeyboardEvent<SVGGElement>, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.min(count - 1, Math.max(0, i + (e.key === 'ArrowRight' ? 1 : -1)));
      setSelected(next);
      const sibling = e.currentTarget.parentElement?.querySelector<SVGGElement>(
        `[data-point-index="${next}"]`,
      );
      sibling?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected(i);
    }
  };

  return (
    <section
      data-inspect-label="RevenueChartCard"
      aria-label="Revenue overview"
      className="min-w-0 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">Revenue Overview</h2>
          <p className="text-xs text-slate-500">{timeframeLabel}</p>
        </div>
        <div
          role="group"
          aria-label="Chart series"
          className="inline-flex shrink-0 rounded-lg bg-slate-100 p-0.5 text-xs font-medium"
        >
          {(
            [
              ['compare', 'Revenue vs. Expenses'],
              ['revenue', 'Revenue Only'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
              className={`rounded-md px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 ${
                mode === key
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-200/90 bg-slate-50/70 p-3 sm:grid-cols-4"
        aria-live="polite"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Period</p>
          <p className="truncate text-sm font-semibold text-slate-900">{active?.label ?? '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <span className="size-2 rounded-sm bg-blue-600" aria-hidden="true" />
            Revenue
          </p>
          <p className="truncate text-sm font-semibold text-slate-900 tabular-nums">
            {active?.formattedRevenue ?? '—'}
          </p>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <span className="size-2 rounded-full bg-slate-400" aria-hidden="true" />
            Expenses
          </p>
          <p className="truncate text-sm font-semibold text-slate-900 tabular-nums">
            {active?.formattedExpenses ?? '—'}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Orders</p>
          <p className="truncate text-sm font-semibold text-slate-900 tabular-nums">
            {active ? active.ordersCount.toLocaleString('en-US') : '—'}
            {margin !== null && mode === 'compare' && (
              <span className="ml-1.5 text-xs font-medium text-slate-500">
                · {margin.toFixed(0)}% margin
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        {count === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
            No revenue data for this period.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="group"
            aria-label={`Revenue${mode === 'compare' ? ' and expenses' : ''} chart, ${count} data points`}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={yFor(t)}
                  y2={yFor(t)}
                  stroke="#e2e8f0"
                  strokeDasharray={t === 0 ? undefined : '3 4'}
                />
                <text
                  x={PAD.left - 8}
                  y={yFor(t) + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] tabular-nums"
                >
                  {compact(t)}
                </text>
              </g>
            ))}

            {series.map((p, i) => {
              const isActive = i === activeIndex;
              const top = yFor(p.revenue);
              const h = Math.max(0, PAD.top + PLOT_H - top);
              return (
                <g
                  key={`${p.label}-${i}`}
                  data-point-index={i}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.label}: revenue ${p.formattedRevenue}, expenses ${p.formattedExpenses}, ${p.ordersCount} orders`}
                  aria-pressed={isActive}
                  className="cursor-pointer outline-none [&:focus-visible>rect.hit]:fill-blue-100/70"
                  onMouseEnter={() => selectBy(i)}
                  onFocus={() => selectBy(i)}
                  onClick={() => selectBy(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <rect
                    className="hit"
                    x={PAD.left + slot * i}
                    y={PAD.top}
                    width={slot}
                    height={PLOT_H}
                    fill={isActive ? '#eff6ff' : 'transparent'}
                  />
                  <rect
                    x={xCenter(i) - barW / 2}
                    y={top}
                    width={barW}
                    height={h}
                    rx={Math.min(4, barW / 2)}
                    className={isActive ? 'fill-blue-600' : 'fill-blue-400'}
                  />
                </g>
              );
            })}

            {mode === 'compare' && count > 0 && (
              <g pointerEvents="none">
                <path
                  d={expensePath}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {series.map((p, i) => (
                  <circle
                    key={`dot-${i}`}
                    cx={xCenter(i)}
                    cy={yFor(p.expenses)}
                    r={i === activeIndex ? 4.5 : 2.5}
                    fill="#fff"
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                ))}
              </g>
            )}

            {series.map((p, i) =>
              i % labelEvery === 0 ? (
                <text
                  key={`x-${i}`}
                  x={xCenter(i)}
                  y={H - 8}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px]"
                >
                  {p.label}
                </text>
              ) : null,
            )}
          </svg>
        )}
      </div>

      <div className="mt-6 border-t border-slate-200/90 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Acquisition Channel Mix</h3>
        {channels.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No channel data available.</p>
        ) : (
          <ul className="mt-4 space-y-3.5">
            {channels.map((ch, i) => {
              const pct = Number.isFinite(ch.sharePercent)
                ? Math.min(100, Math.max(0, ch.sharePercent))
                : 0;
              const growthNegative = ch.growth.trim().startsWith('-') || ch.growth.trim().startsWith('−');
              const GrowthIcon = growthNegative ? ArrowDownRight : ArrowUpRight;
              return (
                <li key={ch.id} className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-900">{ch.name}</span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="text-slate-500">{ch.revenue}</span>
                      <span className="w-10 text-right font-semibold text-slate-900">{pct}%</span>
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          growthNegative
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <GrowthIcon className="size-3" aria-hidden="true" />
                        {ch.growth}
                      </span>
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${ch.name} share`}
                  >
                    <div
                      className={`h-full rounded-full ${CHANNEL_BARS[i % CHANNEL_BARS.length]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
