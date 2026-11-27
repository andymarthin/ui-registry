import { useState } from 'react';
import { ArrowUpRight, Menu, Sparkles, X } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface NavDrawerMeta {
  label: string;
  value: string;
}

export interface FloatingGlassNavProps {
  brandName: string;
  brandSubtitle?: string;
  brandMonogram?: string;
  navItems: NavItem[];
  activeSection?: string;
  onSelectSection?: (item: NavItem) => void;
  ctaLabel?: string;
  ctaHref?: string;
  drawerMeta?: NavDrawerMeta[];
  className?: string;
}

export function FloatingGlassNav({
  brandName,
  brandSubtitle = 'Portfolio',
  brandMonogram,
  navItems,
  activeSection,
  onSelectSection,
  ctaLabel = 'Get in touch',
  ctaHref = '#contact',
  drawerMeta = [],
  className = '',
}: FloatingGlassNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initials =
    brandMonogram ||
    brandName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

  const handleNavClick = (item: NavItem) => {
    onSelectSection?.(item);
    setDrawerOpen(false);
  };

  return (
    <header
      data-inspect-label="FloatingGlassNav"
      className={[
        'sticky top-3 z-30 mx-auto w-full max-w-5xl px-3 sm:top-4 sm:px-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <nav
        aria-label="Primary navigation"
        className="relative flex items-center justify-between gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-2.5 py-2 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_48px_rgba(2,6,23,0.55)] sm:px-3.5"
      >
        {/* Brand Badge */}
        <a
          href="#top"
          onClick={() => setDrawerOpen(false)}
          className="group flex min-w-0 items-center gap-2.5 rounded-full pr-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-blue-400/35 via-indigo-400/20 to-cyan-300/25 text-xs font-semibold tracking-wider text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_0_20px_rgba(96,165,250,0.35)]">
            {initials}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium tracking-tight text-white">
              {brandName}
            </span>
            <span className="hidden truncate text-[11px] leading-none text-slate-300/75 sm:block">
              {brandSubtitle}
            </span>
          </span>
        </a>

        {/* Desktop Interactive Section Pills */}
        <div className="hidden items-center gap-1 rounded-full border border-white/[0.09] bg-black/20 p-1 md:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item)}
                className={[
                  'rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-all duration-200',
                  isActive
                    ? 'border border-white/25 bg-white/[0.15] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : 'border border-transparent text-slate-300 hover:bg-white/[0.08] hover:text-white',
                ].join(' ')}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right Actions + Drawer Trigger */}
        <div className="flex shrink-0 items-center gap-1.5">
          {ctaLabel && (
            <a
              href={ctaHref}
              onClick={() => setDrawerOpen(false)}
              className="hidden items-center gap-1.5 rounded-full border border-blue-300/35 bg-blue-400/20 px-3.5 py-1.5 text-xs font-medium text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition hover:border-blue-300/55 hover:bg-blue-400/30 sm:inline-flex"
            >
              <span>{ctaLabel}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}

          <button
            type="button"
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.07] text-slate-100 transition hover:border-white/30 hover:bg-white/[0.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
          >
            {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Expandable Glass Drawer Panel */}
      {drawerOpen && (
        <div className="mt-2.5 overflow-hidden rounded-3xl border border-white/[0.15] bg-[#0B1020]/80 p-4 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_28px_72px_rgba(2,6,23,0.75)] sm:p-5">
          <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300/85">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Navigation</span>
              </p>
              <div className="grid gap-1.5">
                {navItems.map((item, idx) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => handleNavClick(item)}
                      className={[
                        'flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-sm transition',
                        isActive
                          ? 'border-blue-400/40 bg-blue-400/15 text-white'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] text-slate-400">
                          0{idx + 1}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.03] p-3.5">
              <div className="space-y-2.5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Studio Snapshot
                </p>
                {drawerMeta.length > 0 ? (
                  <dl className="space-y-2">
                    {drawerMeta.map((entry) => (
                      <div
                        key={entry.label}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <dt className="text-slate-400">{entry.label}</dt>
                        <dd className="font-medium text-slate-100">{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-xs leading-relaxed text-slate-300">
                    Interactive glass portfolio architecture with responsive layout
                    breakpoints.
                  </p>
                )}
              </div>

              {ctaLabel && (
                <a
                  href={ctaHref}
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-300/35 bg-blue-400/20 px-3.5 py-2 text-xs font-medium text-blue-100 transition hover:bg-blue-400/30"
                >
                  <span>{ctaLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
