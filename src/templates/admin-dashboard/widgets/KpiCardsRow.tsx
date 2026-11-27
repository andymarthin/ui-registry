import { useId } from 'react';
import {
  DollarSign,
  Percent,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { KpiStat } from '../types';

export interface KpiCardsRowProps {
  kpis: KpiStat[];
  timeframeLabel: string;
}

const ICONS = {
  revenue: DollarSign,
  orders: ShoppingCart,
  customers: Users,
  conversion: Percent,
} as const;

const SPARK_W = 100;
const SPARK_H = 32;
const SPARK_PAD = 3;

function buildSparkline(values: number[]) {
  const clean = (values ?? []).filter((v) => Number.isFinite(v));
  if (clean.length === 0) {
    const y = SPARK_H / 2;
    return { line: `M0 ${y} L${SPARK_W} ${y}`, area: '', empty: true };
  }
  const series = clean.length === 1 ? [clean[0], clean[0]] : clean;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min;
  const step = SPARK_W / (series.length - 1);
  const pts = series.map((v, i) => {
    const norm = range === 0 ? 0.5 : (v - min) / range;
    const y = SPARK_H - SPARK_PAD - norm * (SPARK_H - SPARK_PAD * 2);
    return [Number((i * step).toFixed(2)), Number(y.toFixed(2))] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const area = `${line} L${SPARK_W} ${SPARK_H} L0 ${SPARK_H} Z`;
  return { line, area, empty: false };
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const gradId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { line, area, empty } = buildSparkline(values);
  return (
    <svg
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      preserveAspectRatio="none"
      className="h-10 w-full"
      role="img"
      aria-label={empty ? 'No trend data' : positive ? 'Upward trend' : 'Downward trend'}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#${gradId})`} />}
      <path
        d={line}
        fill="none"
        stroke={empty ? '#cbd5e1' : '#2563eb'}
        strokeWidth="1.75"
        strokeDasharray={empty ? '3 3' : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiCardsRow({ kpis, timeframeLabel }: KpiCardsRowProps) {
  return (
    <section
      data-inspect-label="KpiCardsRow"
      aria-label="Key performance indicators"
      className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {kpis.map((kpi) => {
        const Icon = ICONS[kpi.icon] ?? DollarSign;
        const DeltaIcon = kpi.positive ? TrendingUp : TrendingDown;
        return (
          <article
            key={kpi.id}
            className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <p className="truncate text-sm font-medium text-slate-500">{kpi.label}</p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                  kpi.positive
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70'
                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/70'
                }`}
              >
                <DeltaIcon className="size-3" aria-hidden="true" />
                {kpi.delta}
              </span>
            </div>

            <p className="truncate text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpi.value}
            </p>

            <Sparkline values={kpi.sparkline} positive={kpi.positive} />

            <p className="text-xs text-slate-500">
              {kpi.sublabel}
              <span className="text-slate-400"> · {timeframeLabel}</span>
            </p>
          </article>
        );
      })}
    </section>
  );
}
