import { useState } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  FloatingGlassNav,
  type NavDrawerMeta,
  type NavItem,
} from './FloatingGlassNav';
import { GlassSpheresCanvas } from './GlassSpheresCanvas';
import {
  ProjectGalleryCard,
  type ProjectGalleryCardProps,
} from './ProjectGalleryCard';

export interface HeroMetric {
  label: string;
  value: string;
}

export interface HeroData {
  availabilityText: string;
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  bio: string;
  location: string;
  metrics: HeroMetric[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface TimelineEntry {
  id: string;
  period: string;
  title: string;
  organization: string;
  location?: string;
  summary: string;
  tags?: string[];
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface GlassPortfolioLayoutProps {
  brandName: string;
  brandSubtitle?: string;
  brandMonogram?: string;
  navItems: NavItem[];
  navCtaLabel?: string;
  navCtaHref?: string;
  drawerMeta?: NavDrawerMeta[];
  hero: HeroData;
  workSectionTitle?: string;
  workSectionSubtitle?: string;
  projects: ProjectGalleryCardProps[];
  workHistoryTitle?: string;
  workHistory: TimelineEntry[];
  educationTitle?: string;
  education: TimelineEntry[];
  capabilities?: string[];
  contactHeadline?: string;
  contactEmail?: string;
  footerLinks?: FooterLink[];
  copyrightText?: string;
  canvasIntensity?: number;
}

export function GlassPortfolioLayout({
  brandName,
  brandSubtitle,
  brandMonogram,
  navItems,
  navCtaLabel,
  navCtaHref,
  drawerMeta,
  hero,
  workSectionTitle = 'Selected Work',
  workSectionSubtitle = 'Interactive systems, spatial interfaces, and production software.',
  projects,
  workHistoryTitle = 'Work History',
  workHistory,
  educationTitle = 'Education & Fellowships',
  education,
  capabilities = [],
  contactHeadline = 'Available for select product engineering & design-systems collaborations.',
  contactEmail,
  footerLinks = [],
  copyrightText,
  canvasIntensity = 1,
}: GlassPortfolioLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? 'work',
  );

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-x-hidden bg-[#05060D] text-slate-100 selection:bg-blue-400/30 selection:text-white"
    >
      {/* Animated Refractive Glass Spheres Backdrop */}
      <GlassSpheresCanvas intensity={canvasIntensity} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky Floating Frosted-Glass Pill Navbar */}
        <FloatingGlassNav
          brandName={brandName}
          brandSubtitle={brandSubtitle}
          brandMonogram={brandMonogram}
          navItems={navItems}
          activeSection={activeSection}
          onSelectSection={(item) => setActiveSection(item.id)}
          ctaLabel={navCtaLabel}
          ctaHref={navCtaHref}
          drawerMeta={drawerMeta}
        />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
          {/* Luminous Frosted-Glass Hero Card */}
          <section
            data-inspect-label="HeroGlassCard"
            className="relative overflow-hidden rounded-[2rem] border border-white/[0.16] bg-white/[0.05] p-5 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_28px_80px_rgba(2,6,23,0.7)] sm:p-10"
          >
            {/* Specular inner rim accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl"
            />

            <div className="relative z-10">
              {/* Availability & Location Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span>{hero.availabilityText}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-blue-300" />
                  <span>{hero.location}</span>
                </div>
              </div>

              {/* Eyebrow & Display Headline */}
              <p className="mt-6 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-blue-300/90">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{hero.eyebrow}</span>
              </p>

              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                {hero.headline}{' '}
                {hero.headlineAccent && (
                  <span className="bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                    {hero.headlineAccent}
                  </span>
                )}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300/90 sm:text-base">
                {hero.bio}
              </p>

              {/* CTAs & Metrics */}
              <div className="mt-7 flex flex-col gap-6 border-t border-white/[0.1] pt-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={hero.primaryCta.href}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200/45 bg-gradient-to-r from-blue-500/35 to-indigo-500/35 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(59,130,246,0.28)] transition hover:border-blue-200/65 hover:from-blue-500/45 hover:to-indigo-500/45"
                  >
                    <span>{hero.primaryCta.label}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>

                  <a
                    href={hero.secondaryCta.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-100 backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.12]"
                  >
                    <Mail className="h-4 w-4 text-blue-300" />
                    <span>{hero.secondaryCta.label}</span>
                  </a>
                </div>

                {/* Metrics Strip */}
                <dl className="grid grid-cols-3 gap-2 sm:gap-4">
                  {hero.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="min-w-0 rounded-2xl border border-white/[0.1] bg-black/25 px-2.5 py-2 backdrop-blur-md sm:px-4 sm:py-2.5"
                    >
                      <dt className="text-[9px] font-medium uppercase leading-tight tracking-normal text-slate-400 sm:text-[10px] sm:tracking-wider">
                        {metric.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold tracking-tight text-white sm:text-lg">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* Interactive Project Gallery Section */}
          <section
            id="work"
            data-inspect-label="SelectedWorkSection"
            className="mt-12 scroll-mt-24 sm:mt-16"
          >
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300/85">
                  Case Studies
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {workSectionTitle}
                </h2>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-slate-300/80 sm:text-right sm:text-sm">
                {workSectionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {projects.map((project, index) => (
                <ProjectGalleryCard
                  key={project.id ?? project.title}
                  {...project}
                  indexLabel={
                    project.indexLabel ??
                    `Project ${String(index + 1).padStart(2, '0')}`
                  }
                />
              ))}
            </div>
          </section>

          {/* 2-Column Work History & Education Timeline Section */}
          <section
            id="experience"
            data-inspect-label="ExperienceEducationTimeline"
            className="mt-12 scroll-mt-24 sm:mt-16"
          >
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300/85">
                Background
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Experience &amp; Credentials
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Work History Column */}
              <div className="rounded-3xl border border-white/[0.14] bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_56px_rgba(2,6,23,0.6)] sm:p-6">
                <div className="flex items-center justify-between border-b border-white/[0.09] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-300/25 bg-blue-400/15 text-blue-200">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {workHistoryTitle}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {workHistory.length} roles
                  </span>
                </div>

                <ol className="relative mt-5 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-gradient-to-b before:from-blue-400/50 before:via-white/15 before:to-transparent">
                  {workHistory.map((item) => (
                    <li key={item.id} className="relative pl-8">
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 left-0 flex h-5 w-5 items-center justify-center rounded-full border border-blue-300/45 bg-[#0A1124]"
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
                      </span>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-200/90">
                          <Calendar className="h-3 w-3" />
                          {item.period}
                        </span>
                        {item.location && (
                          <span className="text-[11px] text-slate-400">
                            {item.location}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-1.5 text-sm font-semibold text-white sm:text-base">
                        {item.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-300">
                        {item.organization}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300/85 sm:text-sm">
                        {item.summary}
                      </p>

                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Education & Capabilities Column */}
              <div className="flex flex-col gap-6">
                <div className="rounded-3xl border border-white/[0.14] bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_56px_rgba(2,6,23,0.6)] sm:p-6">
                  <div className="flex items-center justify-between border-b border-white/[0.09] pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-indigo-300/25 bg-indigo-400/15 text-indigo-200">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-semibold text-white sm:text-lg">
                        {educationTitle}
                      </h3>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      {education.length} entries
                    </span>
                  </div>

                  <ol className="relative mt-5 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-gradient-to-b before:from-indigo-400/50 before:via-white/15 before:to-transparent">
                    {education.map((item) => (
                      <li key={item.id} className="relative pl-8">
                        <span
                          aria-hidden="true"
                          className="absolute top-1.5 left-0 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-300/45 bg-[#0A1124]"
                        >
                          <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
                        </span>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-200/90">
                            <Calendar className="h-3 w-3" />
                            {item.period}
                          </span>
                          {item.location && (
                            <span className="text-[11px] text-slate-400">
                              {item.location}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-1.5 text-sm font-semibold text-white sm:text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs font-medium text-slate-300">
                          {item.organization}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300/85 sm:text-sm">
                          {item.summary}
                        </p>

                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                {capabilities.length > 0 && (
                  <div className="rounded-3xl border border-white/[0.14] bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] sm:p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Core Capabilities
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-xs text-slate-200"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Compact Glass Footer */}
          <footer
            id="contact"
            data-inspect-label="PortfolioFooter"
            className="mt-12 scroll-mt-24 rounded-3xl border border-white/[0.14] bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] sm:mt-16 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-lg">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300/85">
                  Connect
                </p>
                <p className="mt-1.5 text-base font-medium text-white sm:text-lg">
                  {contactHeadline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-300/35 bg-blue-400/20 px-4 py-2 text-xs font-medium text-blue-50 transition hover:bg-blue-400/30"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{contactEmail}</span>
                  </a>
                )}

                {footerLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer noopener' : undefined}
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.14] bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/[0.1]"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {copyrightText && (
              <div className="mt-6 border-t border-white/[0.08] pt-4 text-xs text-slate-400">
                {copyrightText}
              </div>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
