import { useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export type ProjectSlideVisualVariant =
  | 'glass-ui'
  | 'spatial-grid'
  | 'waveform'
  | 'shader-orb'
  | 'node-graph'
  | 'metrics-hud';

export interface ProjectSlide {
  id: string;
  title: string;
  subtitle: string;
  metricLabel?: string;
  metricValue?: string;
  accentFrom: string;
  accentTo: string;
  variant: ProjectSlideVisualVariant;
  badges?: string[];
  renderVisual?: () => ReactNode;
}

export interface ProjectLink {
  label: string;
  href: string;
  external?: boolean;
  variant?: 'primary' | 'secondary';
}

export interface ProjectGalleryCardProps {
  id?: string;
  indexLabel?: string;
  title: string;
  role: string;
  year: string;
  summary: string;
  slides: ProjectSlide[];
  techTags: string[];
  links: ProjectLink[];
  className?: string;
}

function SlideVisualArtwork({ slide }: { slide: ProjectSlide }) {
  if (slide.renderVisual) {
    return <>{slide.renderVisual()}</>;
  }

  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at 20% 20%, ${slide.accentFrom}44, transparent 58%), radial-gradient(circle at 82% 78%, ${slide.accentTo}40, transparent 60%)`,
  };

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070B18] p-4 sm:p-6"
      style={gradientStyle}
    >
      {/* Subtle blueprint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {slide.variant === 'glass-ui' && (
        <div className="relative z-10 grid w-full max-w-md grid-cols-12 gap-2.5">
          <div className="col-span-7 rounded-2xl border border-white/20 bg-white/[0.08] p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
            <div className="flex items-center justify-between">
              <span className="h-2 w-16 rounded-full bg-white/40" />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: slide.accentFrom }}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-4/5 rounded-md bg-white/25" />
              <div className="h-2 w-3/5 rounded-md bg-white/15" />
            </div>
            <div className="mt-4 flex gap-2">
              <span className="h-6 w-16 rounded-full border border-white/25 bg-white/15" />
              <span className="h-6 w-12 rounded-full border border-white/15 bg-white/[0.06]" />
            </div>
          </div>
          <div className="col-span-5 flex flex-col gap-2.5">
            <div className="flex-1 rounded-2xl border border-white/20 bg-white/[0.07] p-3 backdrop-blur-xl">
              <div
                className="h-8 w-8 rounded-full border border-white/30"
                style={{
                  background: `radial-gradient(circle at 30% 30%, #ffffff, ${slide.accentFrom} 55%, ${slide.accentTo})`,
                }}
              />
              <div className="mt-3 h-2 w-full rounded bg-white/20" />
              <div className="mt-1.5 h-2 w-2/3 rounded bg-white/10" />
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-10 rounded bg-white/30" />
                <span className="font-mono text-[10px] text-blue-200">
                  99.4%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {slide.variant === 'spatial-grid' && (
        <div className="relative z-10 flex w-full max-w-md items-center justify-center">
          <div className="relative flex h-36 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl">
            <svg
              viewBox="0 0 320 140"
              className="h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id={`spatial-${slide.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={slide.accentFrom} />
                  <stop offset="100%" stopColor={slide.accentTo} />
                </linearGradient>
              </defs>
              <path
                d="M28 104 L96 42 L176 74 L244 26 L296 58"
                fill="none"
                stroke={`url(#spatial-${slide.id})`}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M28 118 L112 88 L186 106 L296 86"
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {[
                [28, 104],
                [96, 42],
                [176, 74],
                [244, 26],
                [296, 58],
              ].map(([x, y], idx) => (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={slide.accentFrom}
                    fillOpacity="0.22"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#FFFFFF"
                    stroke={slide.accentFrom}
                    strokeWidth="1.5"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {slide.variant === 'shader-orb' && (
        <div className="relative z-10 flex items-center justify-center">
          <div
            className="relative h-32 w-32 rounded-full border border-white/40 shadow-[0_0_48px_rgba(96,165,250,0.4)] sm:h-36 sm:w-36"
            style={{
              background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.92) 0%, ${slide.accentFrom}88 26%, rgba(12,18,38,0.85) 68%, ${slide.accentTo}aa 100%)`,
            }}
          >
            <div className="absolute top-3 left-5 h-7 w-12 -rotate-25 rounded-full bg-white/55 blur-[2px]" />
            <div
              className="absolute -inset-4 rounded-full border border-white/15"
              style={{ transform: 'rotateX(68deg) rotateZ(-18deg)' }}
            />
            <div
              className="absolute -inset-7 rounded-full border border-blue-300/20"
              style={{ transform: 'rotateX(72deg) rotateZ(22deg)' }}
            />
          </div>
        </div>
      )}

      {slide.variant === 'waveform' && (
        <div className="relative z-10 flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-mono uppercase tracking-wider">
              Spectral Engine
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px]">
              48 kHz / 24-bit
            </span>
          </div>
          <div className="flex h-20 items-end justify-between gap-1.5">
            {[28, 52, 74, 44, 92, 68, 86, 40, 64, 96, 58, 76, 48, 34, 60, 42].map(
              (heightPct, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-full transition-all"
                  style={{
                    height: `${heightPct}%`,
                    background: `linear-gradient(180deg, ${slide.accentFrom}, ${slide.accentTo})`,
                    opacity: 0.45 + (heightPct / 100) * 0.55,
                  }}
                />
              ),
            )}
          </div>
        </div>
      )}

      {slide.variant === 'node-graph' && (
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.05] p-3.5 backdrop-blur-xl">
          <svg
            viewBox="0 0 320 120"
            className="h-32 w-full"
            aria-hidden="true"
          >
            <path
              d="M52 60 C 96 60, 108 28, 152 28 C 196 28, 212 60, 266 60"
              fill="none"
              stroke={slide.accentFrom}
              strokeWidth="2"
              strokeOpacity="0.8"
            />
            <path
              d="M52 60 C 96 60, 108 92, 152 92 C 196 92, 212 60, 266 60"
              fill="none"
              stroke={slide.accentTo}
              strokeWidth="2"
              strokeOpacity="0.7"
            />
            <rect
              x="16"
              y="42"
              width="52"
              height="36"
              rx="10"
              fill="rgba(255,255,255,0.1)"
              stroke="rgba(255,255,255,0.28)"
            />
            <rect
              x="126"
              y="10"
              width="64"
              height="34"
              rx="10"
              fill="rgba(96,165,250,0.16)"
              stroke={slide.accentFrom}
            />
            <rect
              x="126"
              y="74"
              width="64"
              height="34"
              rx="10"
              fill="rgba(129,140,248,0.16)"
              stroke={slide.accentTo}
            />
            <rect
              x="246"
              y="42"
              width="58"
              height="36"
              rx="10"
              fill="rgba(255,255,255,0.12)"
              stroke="rgba(255,255,255,0.34)"
            />
          </svg>
        </div>
      )}

      {slide.variant === 'metrics-hud' && (
        <div className="relative z-10 grid w-full max-w-md grid-cols-3 gap-2.5">
          {[
            { label: 'Frame Time', value: '8.2ms' },
            { label: 'Shaders', value: '12 pass' },
            { label: 'Throughput', value: '120 Hz' },
          ].map((item, idx) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/20 bg-white/[0.07] p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
            >
              <div
                className="h-1.5 w-8 rounded-full"
                style={{
                  backgroundColor: idx % 2 === 0 ? slide.accentFrom : slide.accentTo,
                }}
              />
              <p className="mt-3 font-mono text-sm font-semibold text-white">
                {item.value}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-300/80">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Floating slide badges */}
      {slide.badges && slide.badges.length > 0 && (
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {slide.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-200 backdrop-blur-md"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectGalleryCard({
  id,
  indexLabel,
  title,
  role,
  year,
  summary,
  slides,
  techTags,
  links,
  className = '',
}: ProjectGalleryCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = slides.length;
  const safeIndex = totalSlides > 0 ? activeIndex % totalSlides : 0;
  const currentSlide = slides[safeIndex];

  const handlePrev = () => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  };

  return (
    <article
      id={id}
      data-inspect-label="ProjectGalleryCard"
      className={[
        'group flex min-w-0 flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.14] bg-white/[0.04] p-4 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_64px_rgba(2,6,23,0.65)] transition-colors duration-300 hover:border-white/[0.24] sm:p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header Metadata */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {indexLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-300/25 bg-blue-400/10 px-2.5 py-0.5 font-mono text-[11px] text-blue-200">
                <Layers className="h-3 w-3" />
                {indexLabel}
              </span>
            )}
            <span className="text-xs font-medium text-slate-300/85">
              {role}
            </span>
          </div>
          <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
            {year}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300/90">
          {summary}
        </p>

        {/* Interactive Multi-Slide Visual Frame */}
        {currentSlide && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.14] bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            <div className="relative h-48 w-full sm:h-56">
              <SlideVisualArtwork slide={currentSlide} />

              {/* Prev / Next Controls */}
              {totalSlides > 1 && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Previous slide for ${title}`}
                    onClick={handlePrev}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Next slide for ${title}`}
                    onClick={handleNext}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Counter Pill */}
              <div className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 font-mono text-[10px] text-slate-200 backdrop-blur-md">
                {String(safeIndex + 1).padStart(2, '0')} /{' '}
                {String(totalSlides).padStart(2, '0')}
              </div>
            </div>

            {/* Slide Caption & Clickable Dots */}
            <div className="flex flex-col gap-3 border-t border-white/[0.1] bg-white/[0.03] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">
                  {currentSlide.title}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {currentSlide.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                {currentSlide.metricLabel && currentSlide.metricValue && (
                  <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-blue-200 whitespace-nowrap">
                    {currentSlide.metricLabel}: {currentSlide.metricValue}
                  </span>
                )}

                {totalSlides > 1 && (
                  <div
                    role="tablist"
                    aria-label={`Slide selector for ${title}`}
                    className="flex items-center gap-1.5"
                  >
                    {slides.map((slide, idx) => {
                      const active = idx === safeIndex;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          aria-label={`Show slide ${idx + 1}: ${slide.title}`}
                          onClick={() => setActiveIndex(idx)}
                          className={[
                            'h-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70',
                            active
                              ? 'w-6 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.65)]'
                              : 'w-2 bg-white/25 hover:bg-white/45',
                          ].join(' ')}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tags & Action Links */}
      <div className="mt-5 flex flex-col gap-4 border-t border-white/[0.09] pt-4">
        <div className="flex flex-wrap gap-1.5">
          {techTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/[0.11] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-200/90"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const isPrimary = link.variant !== 'secondary';
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer noopener' : undefined}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition',
                  isPrimary
                    ? 'border border-blue-300/35 bg-blue-400/20 text-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:border-blue-300/55 hover:bg-blue-400/30'
                    : 'border border-white/[0.14] bg-white/[0.05] text-slate-200 hover:border-white/30 hover:bg-white/[0.12]',
                ].join(' ')}
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>
      </div>
    </article>
  );
}
