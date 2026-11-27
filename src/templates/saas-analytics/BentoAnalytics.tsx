import { useId, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

export type AnalyticsTimeframe = '7D' | '30D' | '90D';
export type KpiAccent = 'violet' | 'cyan' | 'emerald' | 'amber';

export interface RevenueSeriesPoint {
  label: string;
  value: number;
  formattedValue: string;
  secondaryLabel?: string;
}

export interface AnalyticsKpiItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  sublabel: string;
  accent: KpiAccent;
}

export interface AcquisitionChannel {
  id: string;
  name: string;
  sharePercent: number;
  revenue: string;
  growth: string;
  barColor: string;
  dotColor: string;
}

export interface TimeframeAnalyticsDataset {
  timeframeLabel: string;
  hero: {
    eyebrow: string;
    value: string;
    delta: string;
    positive: boolean;
    comparisonLabel: string;
    goalLabel: string;
    goalPercent: number;
  };
  series: RevenueSeriesPoint[];
  kpis: AnalyticsKpiItem[];
  channels: AcquisitionChannel[];
}

export interface BentoAnalyticsProps {
  workspaceName: string;
  title: string;
  subtitle?: string;
  syncLabel?: string;
  defaultTimeframe?: AnalyticsTimeframe;
  datasets: Record<AnalyticsTimeframe, TimeframeAnalyticsDataset>;
}

const TIMEFRAMES: AnalyticsTimeframe[] = ['7D', '30D', '90D'];

const KPI_ACCENT_STYLES: Record<
  KpiAccent,
  { iconBg: string; iconText: string; glow: string }
> = {
  violet: {
    iconBg: 'bg-violet-500/15 border-violet-400/25',
    iconText: 'text-violet-300',
    glow: 'from-violet-500/15 via-transparent to-transparent',
  },
  cyan: {
    iconBg: 'bg-cyan-500/15 border-cyan-400/25',
    iconText: 'text-cyan-300',
    glow: 'from-cyan-500/15 via-transparent to-transparent',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15 border-emerald-400/25',
    iconText: 'text-emerald-300',
    glow: 'from-emerald-500/15 via-transparent to-transparent',
  },
  amber: {
    iconBg: 'bg-amber-500/15 border-amber-400/25',
    iconText: 'text-amber-300',
    glow: 'from-amber-500/15 via-transparent to-transparent',
  },
};

interface ChartCoordinate {
  x: number;
  y: number;
  point: RevenueSeriesPoint;
}

function buildSmoothSvgPaths(
  points: RevenueSeriesPoint[],
  width: number,
  height: number,
  padX: number,
  padTop: number,
  padBottom: number,
): {
  linePath: string;
  areaPath: string;
  coords: ChartCoordinate[];
} {
  if (points.length === 0) {
    return { linePath: '', areaPath: '', coords: [] };
  }

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const usableW = width - padX * 2;
  const usableH = height - padTop - padBottom;

  const coords: ChartCoordinate[] = points.map((point, idx) => {
    const x =
      points.length === 1
        ? width / 2
        : padX + (idx / (points.length - 1)) * usableW;
    const normalized = (point.value - minVal) / range;
    const y = padTop + usableH - normalized * usableH;
    return { x, y, point };
  });

  if (coords.length === 1) {
    const { x, y } = coords[0];
    const linePath = `M ${x} ${y}`;
    const areaPath = `M ${x} ${height - padBottom} L ${x} ${y} L ${x} ${height - padBottom} Z`;
    return { linePath, areaPath, coords };
  }

  let linePath = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const current = coords[i];
    const next = coords[i + 1];
    const ctrlX = ((current.x + next.x) / 2).toFixed(2);
    linePath += ` C ${ctrlX} ${current.y.toFixed(2)}, ${ctrlX} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  const baselineY = (height - padBottom + 12).toFixed(2);
  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${linePath} L ${last.x.toFixed(2)} ${baselineY} L ${first.x.toFixed(2)} ${baselineY} Z`;

  return { linePath, areaPath, coords };
}

function renderKpiIcon(index: number, className: string) {
  if (index === 0) return <DollarSign className={className} />;
  if (index === 1) return <TrendingUp className={className} />;
  if (index === 2) return <Users className={className} />;
  return <Activity className={className} />;
}

export function BentoAnalytics({
  workspaceName,
  title,
  subtitle = 'Net revenue velocity, retention cohort health, and channel attribution.',
  syncLabel = 'Live telemetry · Updated 2m ago',
  defaultTimeframe = '30D',
  datasets,
}: BentoAnalyticsProps) {
  const gradientUid = useId().replace(/:/g, '');
  const [timeframe, setTimeframe] =
    useState<AnalyticsTimeframe>(defaultTimeframe);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const activeData = datasets[timeframe];

  const chart = useMemo(
    () => buildSmoothSvgPaths(activeData.series, 640, 230, 18, 22, 24),
    [activeData.series],
  );

  const fallbackIdx = Math.max(0, activeData.series.length - 1);
  const rawActiveIdx = hoveredIndex ?? selectedIndex ?? fallbackIdx;
  const activeIdx = Math.min(rawActiveIdx, fallbackIdx);
  const activeCoord = chart.coords[activeIdx] ?? null;

  const handleTimeframeChange = (next: AnalyticsTimeframe) => {
    setTimeframe(next);
    setHoveredIndex(null);
    setSelectedIndex(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#09090B] font-sans text-zinc-100 antialiased">
      {/* Ambient Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(640px circle at 16% 10%, rgba(139, 92, 246, 0.14), transparent 60%)',
            'radial-gradient(560px circle at 88% 24%, rgba(6, 182, 212, 0.10), transparent 58%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6 lg:p-8">
        {/* 1. Analytics Header + Timeframe Selector */}
        <header
          data-inspect-label="AnalyticsHeader"
          className="flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-[#18181B]/70 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                <Sparkles className="h-3 w-3" />
                {workspaceName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                {syncLabel}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center self-start rounded-full border border-white/[0.08] bg-[#09090B]/80 p-1 sm:self-auto">
            {TIMEFRAMES.map((tf) => {
              const isActive = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleTimeframeChange(tf)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Bento Grid: Tall Hero Revenue Card + 2x2 KPI Pills */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* 2. Tall Hero Revenue Card */}
          <section
            data-inspect-label="HeroRevenueCard"
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/70 p-5 backdrop-blur-md sm:p-6 lg:col-span-7"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-400 uppercase">
                  <span>{activeData.hero.eyebrow}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">
                    {activeData.timeframeLabel}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-semibold tracking-tight text-zinc-50 tabular-nums sm:text-4xl">
                    {activeData.hero.value}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                      activeData.hero.positive
                        ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                        : 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {activeData.hero.positive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {activeData.hero.delta}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-zinc-400">
                  {activeData.hero.comparisonLabel}
                </p>
              </div>

              {/* Active Point Readout Pill */}
              {activeCoord && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#09090B]/65 px-3.5 py-2 text-left sm:text-right">
                  <div className="text-[11px] font-medium text-zinc-400">
                    {activeCoord.point.label}
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-violet-200 tabular-nums">
                    {activeCoord.point.formattedValue}
                  </div>
                  {activeCoord.point.secondaryLabel && (
                    <div className="text-[11px] text-cyan-300/90">
                      {activeCoord.point.secondaryLabel}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive SVG Area Sparkline */}
            <div className="relative mt-6">
              <svg
                viewBox="0 0 640 230"
                className="h-52 w-full overflow-visible sm:h-60"
                role="img"
                aria-label="Revenue trend area sparkline"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  <linearGradient
                    id={`area-${gradientUid}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.38" />
                    <stop offset="55%" stopColor="#06B6D4" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient
                    id={`stroke-${gradientUid}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="55%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#22D3EE" />
                  </linearGradient>
                </defs>

                {/* Subtle Horizontal Guide Lines */}
                {[48, 108, 168].map((yPos) => (
                  <line
                    key={yPos}
                    x1="18"
                    y1={yPos}
                    x2="622"
                    y2={yPos}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Area Gradient Fill */}
                {chart.areaPath && (
                  <path
                    d={chart.areaPath}
                    fill={`url(#area-${gradientUid})`}
                  />
                )}

                {/* Sparkline Stroke */}
                {chart.linePath && (
                  <path
                    d={chart.linePath}
                    fill="none"
                    stroke={`url(#stroke-${gradientUid})`}
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Vertical Guide on Active Point */}
                {activeCoord && (
                  <line
                    x1={activeCoord.x}
                    y1={16}
                    x2={activeCoord.x}
                    y2={208}
                    stroke="rgba(167,139,250,0.45)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Interactive Points */}
                {chart.coords.map((coord, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <g key={coord.point.label}>
                      {isActive && (
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={10}
                          fill="rgba(139, 92, 246, 0.25)"
                        />
                      )}
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={isActive ? 4.5 : 2.5}
                        fill={isActive ? '#E9D5FF' : '#8B5CF6'}
                        stroke={isActive ? '#8B5CF6' : 'transparent'}
                        strokeWidth={isActive ? 2 : 0}
                      />
                      {/* Generous invisible hit target for mouse + touch */}
                      <rect
                        x={coord.x - 20}
                        y={8}
                        width={40}
                        height={210}
                        fill="transparent"
                        className="cursor-pointer"
                        tabIndex={0}
                        role="button"
                        aria-label={`${coord.point.label}: ${coord.point.formattedValue}`}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onFocus={() => setHoveredIndex(idx)}
                        onClick={() => setSelectedIndex(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedIndex(idx);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis Labels */}
              <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-zinc-500 tabular-nums">
                {activeData.series.map((pt, idx) => {
                  const showOnMobile =
                    idx === 0 ||
                    idx === activeData.series.length - 1 ||
                    idx === Math.floor(activeData.series.length / 2);
                  return (
                    <button
                      key={pt.label}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`transition-colors ${
                        showOnMobile ? 'inline-block' : 'hidden sm:inline-block'
                      } ${
                        idx === activeIdx
                          ? 'font-medium text-violet-300'
                          : 'hover:text-zinc-300'
                      }`}
                    >
                      {pt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Goal Progress Strip */}
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-4 text-xs">
              <span className="text-zinc-400">{activeData.hero.goalLabel}</span>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.08] sm:w-32">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                    style={{
                      width: `${Math.min(100, Math.max(0, activeData.hero.goalPercent))}%`,
                    }}
                  />
                </div>
                <span className="font-medium text-zinc-200 tabular-nums">
                  {activeData.hero.goalPercent}%
                </span>
              </div>
            </div>
          </section>

          {/* 3. Compact Metric Pills (2x2 Bento Sub-Grid) */}
          <section
            data-inspect-label="KpiMetricGrid"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5"
          >
            {activeData.kpis.map((kpi, idx) => {
              const style = KPI_ACCENT_STYLES[kpi.accent];
              return (
                <div
                  key={kpi.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] bg-[#18181B]/70 p-5 backdrop-blur-md transition-colors hover:border-white/[0.14]"
                >
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow}`}
                  />

                  <div className="relative flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border ${style.iconBg}`}
                    >
                      {renderKpiIcon(idx, `h-4 w-4 ${style.iconText}`)}
                    </span>

                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${
                        kpi.positive
                          ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                          : 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      {kpi.positive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {kpi.delta}
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <div className="text-xs font-medium text-zinc-400">
                      {kpi.label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 tabular-nums">
                      {kpi.value}
                    </div>
                    <div className="mt-1.5 text-xs text-zinc-500">
                      {kpi.sublabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* 4. Segmented Horizontal Acquisition Channel Bar */}
        <section
          data-inspect-label="AcquisitionChannels"
          className="rounded-3xl border border-white/[0.08] bg-[#18181B]/70 p-5 backdrop-blur-md sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-cyan-300">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Acquisition Channels
                </h2>
                <p className="text-xs text-zinc-400">
                  Attributed new ARR share across {activeData.timeframeLabel.toLowerCase()}
                </p>
              </div>
            </div>

            <span className="text-xs text-zinc-400">
              {activeChannelId
                ? `Focused: ${
                    activeData.channels.find((c) => c.id === activeChannelId)
                      ?.name ?? ''
                  }`
                : 'Hover or tap any segment to inspect'}
            </span>
          </div>

          {/* Segmented Horizontal Bar */}
          <div className="mt-5 flex h-4 w-full gap-1 overflow-hidden rounded-full bg-[#09090B]/70 p-0.5 ring-1 ring-white/[0.06]">
            {activeData.channels.map((channel) => {
              const isDimmed =
                activeChannelId !== null && activeChannelId !== channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  aria-label={`${channel.name}: ${channel.sharePercent}%`}
                  onMouseEnter={() => setActiveChannelId(channel.id)}
                  onMouseLeave={() => setActiveChannelId(null)}
                  onClick={() =>
                    setActiveChannelId((prev) =>
                      prev === channel.id ? null : channel.id,
                    )
                  }
                  style={{ width: `${channel.sharePercent}%` }}
                  className={`h-full rounded-full transition-all duration-200 ${channel.barColor} ${
                    isDimmed ? 'opacity-30' : 'opacity-100'
                  }`}
                />
              );
            })}
          </div>

          {/* Legend & Channel Metrics */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeData.channels.map((channel) => {
              const isHighlighted = activeChannelId === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onMouseEnter={() => setActiveChannelId(channel.id)}
                  onMouseLeave={() => setActiveChannelId(null)}
                  onClick={() =>
                    setActiveChannelId((prev) =>
                      prev === channel.id ? null : channel.id,
                    )
                  }
                  className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-colors ${
                    isHighlighted
                      ? 'border-violet-400/40 bg-white/[0.05]'
                      : 'border-white/[0.06] bg-[#09090B]/40 hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${channel.dotColor}`}
                      />
                      <span className="text-xs font-medium text-zinc-200">
                        {channel.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-100 tabular-nums">
                      {channel.sharePercent}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between gap-2 tabular-nums">
                    <span className="text-sm font-semibold text-zinc-100">
                      {channel.revenue}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-300">
                      {channel.growth}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BentoAnalytics;
