import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Terminal } from 'lucide-react';

export interface SwissNavItem {
  label: string;
  href: string;
}

export interface SwissStatItem {
  index: string;
  value: string;
  label: string;
  detail: string;
}

export interface SwissFeatureItem {
  number: string;
  tag: string;
  title: string;
  description: string;
  metric: string;
  href?: string;
}

export interface SwissLandingProps {
  brandName: string;
  brandCode: string;
  releaseBadge: string;
  navItems: SwissNavItem[];
  navCtaLabel: string;
  navCtaHref?: string;
  heroKicker: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel: string;
  secondaryCtaHref?: string;
  cliPromptLabel: string;
  cliCommand: string;
  cliHint: string;
  stats: SwissStatItem[];
  featuresHeading: string;
  featuresSubheading: string;
  features: SwissFeatureItem[];
  footerLeft: string;
  footerRight: string;
  onPrimaryAction?: () => void;
}

export function SwissLanding({
  brandName,
  brandCode,
  releaseBadge,
  navItems,
  navCtaLabel,
  navCtaHref = '#deploy',
  heroKicker,
  headlineLine1,
  headlineLine2,
  headlineLine3,
  subheadline,
  primaryCtaLabel,
  primaryCtaHref = '#deploy',
  secondaryCtaLabel,
  secondaryCtaHref = '#architecture',
  cliPromptLabel,
  cliCommand,
  cliHint,
  stats,
  featuresHeading,
  featuresSubheading,
  features,
  footerLeft,
  footerRight,
  onPrimaryAction,
}: SwissLandingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cliCommand);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] font-sans antialiased selection:bg-[#FF4500] selection:text-[#FAFAFA]">
      <div className="mx-auto max-w-[1320px] border-x-0 sm:border-x-2 border-[#0A0A0A]">
        {/* Brutalist Top Bar */}
        <header
          data-inspect-label="TopBar"
          className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#0A0A0A] bg-[#FAFAFA] px-4 py-3.5 sm:px-6 lg:px-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[#0A0A0A] bg-[#0A0A0A] font-mono text-xs font-bold tracking-tighter text-[#FAFAFA] rounded-none">
              {brandCode}
            </div>
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[#0A0A0A]">
              {brandName}
            </span>
            <span className="hidden md:inline-block border-2 border-[#0A0A0A] bg-[#FAFAFA] px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] rounded-none">
              {releaseBadge}
            </span>
          </div>

          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#0A0A0A] underline-offset-4 hover:text-[#FF4500] hover:underline"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={navCtaHref}
              onClick={(e) => {
                if (onPrimaryAction) {
                  e.preventDefault();
                  onPrimaryAction();
                }
              }}
              className="inline-flex items-center gap-1.5 border-2 border-[#0A0A0A] bg-[#FAFAFA] px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0A0A0A] rounded-none transition-colors hover:bg-[#0A0A0A] hover:text-[#FAFAFA]"
            >
              <span>{navCtaLabel}</span>
              <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </a>
          </div>
        </header>

        {/* Asymmetric 2-Column Hero + 2x2 Stats Grid */}
        <section
          data-inspect-label="HeroSection"
          className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-[#0A0A0A]"
        >
          {/* Left Hero Column */}
          <div className="min-w-0 lg:col-span-7 flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-[#0A0A0A] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 border-2 border-[#0A0A0A] bg-[#FAFAFA] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] rounded-none">
                <span className="h-2 w-2 bg-[#FF4500] rounded-none" />
                <span>{heroKicker}</span>
              </div>

              <h1 className="text-[30px] sm:text-5xl lg:text-[56px] break-words font-black uppercase leading-[0.95] tracking-[-0.04em] text-[#0A0A0A]">
                <span className="block">{headlineLine1}</span>
                <span className="block">{headlineLine2}</span>
                <span className="block text-[#FF4500]">{headlineLine3}</span>
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg font-medium leading-relaxed text-[#262626]">
                {subheadline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={primaryCtaHref}
                  onClick={(e) => {
                    if (onPrimaryAction) {
                      e.preventDefault();
                      onPrimaryAction();
                    }
                  }}
                  className="inline-flex items-center gap-2 border-2 border-[#0A0A0A] bg-[#FF4500] px-6 py-3.5 font-mono text-xs sm:text-sm font-black uppercase tracking-[0.1em] text-[#FAFAFA] rounded-none shadow-[4px_4px_0px_#0A0A0A] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#0A0A0A] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  <span>{primaryCtaLabel}</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </a>

                <a
                  href={secondaryCtaHref}
                  className="inline-flex items-center gap-2 border-2 border-[#0A0A0A] bg-[#FAFAFA] px-5 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-[#0A0A0A] rounded-none transition-colors hover:bg-[#0A0A0A] hover:text-[#FAFAFA]"
                >
                  <span>{secondaryCtaLabel}</span>
                </a>
              </div>
            </div>

            {/* Interactive Dark #0A0A0A CLI Copy Box */}
            <div
              data-inspect-label="CliTerminal"
              className="mt-10 border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#FAFAFA] rounded-none"
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                <span className="inline-flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-[#FF4500]" />
                  <span>{cliPromptLabel}</span>
                </span>
                <span className="text-[10px] text-neutral-500">POSIX / SH</span>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs sm:text-sm font-semibold text-[#FAFAFA]">
                  <span className="mr-2 select-none text-[#FF4500]">$</span>
                  {cliCommand}
                </code>

                <button
                  type="button"
                  onClick={handleCopyCommand}
                  aria-label="Copy CLI command"
                  className="shrink-0 inline-flex items-center gap-1.5 border border-white/30 bg-[#171717] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA] rounded-none transition-colors hover:border-[#FF4500] hover:bg-[#FF4500] hover:text-[#FAFAFA] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-white/15 px-4 py-2 font-mono text-[11px] text-neutral-400">
                {cliHint}
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Boxed Stats Grid */}
          <div
            data-inspect-label="StatsGrid"
            className="min-w-0 lg:col-span-5 flex flex-col justify-between bg-[#FAFAFA]"
          >
            <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] px-4 py-3 sm:px-6">
              <span className="font-mono text-xs font-black uppercase tracking-[0.14em]">
                Telemetry // Live Spec
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF4500]">
                SLA 99.99%
              </span>
            </div>

            <div className="grid flex-1 grid-cols-1 sm:grid-cols-2">
              {stats.slice(0, 4).map((stat, idx) => {
                const isRightCol = idx % 2 === 1;
                const isBottomRow = idx >= 2;
                return (
                  <div
                    key={stat.index}
                    className={[
                      'flex flex-col justify-between p-5 sm:p-6 bg-[#FAFAFA] transition-colors hover:bg-neutral-100',
                      'border-[#0A0A0A]',
                      idx < 3 ? 'border-b-2' : '',
                      isBottomRow ? 'sm:border-b-0' : '',
                      !isRightCol ? 'sm:border-r-2' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                        {stat.index}
                      </span>
                      <span className="h-2 w-2 bg-[#0A0A0A] rounded-none" />
                    </div>

                    <div className="my-5">
                      <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-[#0A0A0A]">
                        {stat.value}
                      </div>
                      <div className="mt-1.5 text-xs font-black uppercase tracking-[0.08em] text-[#0A0A0A]">
                        {stat.label}
                      </div>
                    </div>

                    <p className="font-mono text-[11px] leading-snug text-neutral-600">
                      {stat.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Numbered Horizontal Feature Rows */}
        <section
          id="architecture"
          data-inspect-label="FeatureRows"
          className="border-b-2 border-[#0A0A0A]"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b-2 border-[#0A0A0A] bg-[#FAFAFA] px-4 py-6 sm:px-6 lg:px-10">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF4500]">
                System Architecture
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-[-0.03em] text-[#0A0A0A]">
                {featuresHeading}
              </h2>
            </div>
            <p className="max-w-md font-mono text-xs uppercase tracking-wide text-neutral-600">
              {featuresSubheading}
            </p>
          </div>

          <div className="divide-y-2 divide-[#0A0A0A]">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-4 px-4 py-6 sm:px-6 lg:px-10 transition-colors hover:bg-neutral-100"
              >
                <div className="md:col-span-2 flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-tighter tabular-nums text-[#0A0A0A]">
                    {feature.number}
                  </span>
                  <span className="border-2 border-[#0A0A0A] bg-[#FAFAFA] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF4500] rounded-none">
                    {feature.tag}
                  </span>
                </div>

                <div className="md:col-span-3">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-[-0.02em] text-[#0A0A0A]">
                    {feature.title}
                  </h3>
                </div>

                <div className="md:col-span-5">
                  <p className="text-sm sm:text-[15px] font-medium leading-relaxed text-[#262626]">
                    {feature.description}
                  </p>
                </div>

                <div className="md:col-span-2 flex md:justify-end">
                  <a
                    href={feature.href ?? '#deploy'}
                    className="inline-flex items-center gap-1.5 border-2 border-[#0A0A0A] bg-[#FAFAFA] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#0A0A0A] rounded-none transition-colors hover:bg-[#0A0A0A] hover:text-[#FAFAFA]"
                  >
                    <span>{feature.metric}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brutalist Footer Bar */}
        <footer
          data-inspect-label="FooterBar"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#FAFAFA] px-4 py-4 sm:px-6 lg:px-10 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600"
        >
          <span>{footerLeft}</span>
          <span className="text-[#0A0A0A]">{footerRight}</span>
        </footer>
      </div>
    </div>
  );
}

export default SwissLanding;
