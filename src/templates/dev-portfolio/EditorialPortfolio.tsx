import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Mail,
} from 'lucide-react';

export interface EditorialLink {
  label: string;
  href: string;
  meta?: string;
}

export interface EditorialWorkItem {
  id: string;
  year: string;
  title: string;
  role: string;
  category: string;
  summary: string;
  readingNotes: string[];
  outcome: string;
  href?: string;
  linkLabel?: string;
}

export interface EditorialEssayItem {
  date: string;
  title: string;
  readingTime: string;
  href: string;
}

export interface EditorialPortfolioProps {
  issueLabel: string;
  locationLabel: string;
  availabilityLabel: string;
  monogram: string;
  authorName: string;
  authorRole: string;
  thesisStatement: string;
  bioParagraph: string;
  disciplines: string[];
  email: string;
  links: EditorialLink[];
  worksHeading: string;
  worksSubheading: string;
  works: EditorialWorkItem[];
  essaysHeading: string;
  essays: EditorialEssayItem[];
  colophonNote: string;
}

export function EditorialPortfolio({
  issueLabel,
  locationLabel,
  availabilityLabel,
  monogram,
  authorName,
  authorRole,
  thesisStatement,
  bioParagraph,
  disciplines,
  email,
  links,
  worksHeading,
  worksSubheading,
  works,
  essaysHeading,
  essays,
  colophonNote,
}: EditorialPortfolioProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    works[0]?.id ?? null,
  );
  const [copiedEmail, setCopiedEmail] = useState(false);

  const toggleWork = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopyEmail = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      }
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1C1917] font-sans antialiased selection:bg-[#9A3412]/15 selection:text-[#9A3412]">
      <div className="mx-auto max-w-[1180px] px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        {/* Editorial Colophon / Issue Header */}
        <header
          data-inspect-label="ColophonHeader"
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#D6D0C4] pb-4 text-xs tracking-wide text-[#57534E]"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A3412]">
              {issueLabel}
            </span>
            <span className="hidden sm:inline text-[#D6D0C4]">/</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {locationLabel}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#1C1917]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9A3412]" />
              {availabilityLabel}
            </span>
          </div>
        </header>

        {/* Asymmetric Editorial Spread */}
        <main className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          {/* Left Bio Column */}
          <aside
            data-inspect-label="BioColumn"
            className="lg:col-span-5 flex flex-col justify-between gap-10"
          >
            <div>
              {/* Monogram Seal + Identity */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#D6D0C4] bg-[#EFECE3] font-serif text-lg font-medium tracking-tight text-[#9A3412]">
                  {monogram}
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#57534E]">
                    {authorRole}
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-[#1C1917]">
                    {authorName}
                  </h1>
                </div>
              </div>

              {/* Thesis Statement */}
              <blockquote className="mt-8 border-l-2 border-[#9A3412] pl-4 font-serif text-xl sm:text-2xl leading-[1.35] tracking-[-0.015em] text-[#1C1917]">
                {thesisStatement}
              </blockquote>

              <p className="mt-6 text-[15px] leading-[1.7] text-[#44403C]">
                {bioParagraph}
              </p>

              {/* Disciplines */}
              <div className="mt-8 border-t border-[#D6D0C4] pt-6">
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                  Core Disciplines
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {disciplines.map((discipline) => (
                    <li
                      key={discipline}
                      className="border border-[#D6D0C4] bg-[#EFECE3]/60 px-3 py-1 text-xs font-medium text-[#1C1917]"
                    >
                      {discipline}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Correspondence & Links */}
            <div className="border-t border-[#D6D0C4] pt-6">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                Correspondence
              </h2>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border border-[#D6D0C4] bg-[#EFECE3]/70 px-3.5 py-2.5">
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-w-0 items-center gap-2 break-all text-sm font-medium text-[#9A3412] underline decoration-[#9A3412]/40 underline-offset-4 hover:decoration-[#9A3412]"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span>{email}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3 w-3 text-[#9A3412]" />
                      <span className="text-[#9A3412]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <ul className="mt-4 divide-y divide-[#D6D0C4] border-b border-[#D6D0C4]">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center justify-between py-2.5 text-sm text-[#1C1917] transition-colors hover:text-[#9A3412]"
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[#57534E] group-hover:text-[#9A3412]">
                        {link.meta ? <span>{link.meta}</span> : null}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Selected Works Index */}
          <section
            data-inspect-label="SelectedWorks"
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between pb-4 border-b border-[#D6D0C4]">
                <h2 className="font-serif text-2xl sm:text-[28px] font-normal tracking-[-0.02em] text-[#1C1917]">
                  {worksHeading}
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#57534E]">
                  {worksSubheading} · {String(works.length).padStart(2, '0')}
                </span>
              </div>

              <div className="divide-y divide-[#D6D0C4] border-b border-[#D6D0C4]">
                {works.map((work, idx) => {
                  const isExpanded = expandedId === work.id;
                  const indexLabel = String(idx + 1).padStart(2, '0');
                  return (
                    <article
                      key={work.id}
                      className="transition-colors hover:bg-[#EFECE3]/50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleWork(work.id)}
                        aria-expanded={isExpanded}
                        className="w-full text-left py-5 px-1 sm:px-2 flex items-start justify-between gap-4 cursor-pointer"
                      >
                        <div className="grid min-w-0 grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 flex-1 items-baseline">
                          <div className="sm:col-span-3 flex items-center gap-2.5 font-mono text-xs text-[#57534E]">
                            <span className="text-[#9A3412] font-semibold">
                              {indexLabel}
                            </span>
                            <span>{work.year}</span>
                          </div>

                          <div className="sm:col-span-6">
                            <h3 className="font-serif text-lg sm:text-xl font-normal tracking-[-0.01em] text-[#1C1917]">
                              {work.title}
                            </h3>
                            <p className="mt-0.5 text-xs text-[#57534E]">
                              {work.role}
                            </p>
                          </div>

                          <div className="sm:col-span-3 sm:text-right">
                            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-[#57534E] border border-[#D6D0C4] px-2 py-0.5">
                              {work.category}
                            </span>
                          </div>
                        </div>

                        <ChevronDown
                          className={[
                            'mt-1 h-4 w-4 shrink-0 text-[#9A3412] transition-transform duration-200',
                            isExpanded ? 'rotate-180' : 'rotate-0',
                          ].join(' ')}
                        />
                      </button>

                      {isExpanded ? (
                        <div className="px-1 sm:px-2 pb-6 pt-1">
                          <div className="border-l border-[#9A3412]/50 bg-[#EFECE3]/65 p-4 sm:p-5">
                            <p className="text-sm leading-[1.7] text-[#1C1917]">
                              {work.summary}
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 border-t border-[#D6D0C4] pt-4">
                              <div className="sm:col-span-8">
                                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A3412]">
                                  Reading Notes & Architecture
                                </h4>
                                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#44403C]">
                                  {work.readingNotes.map((note) => (
                                    <li
                                      key={note}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#9A3412]" />
                                      <span>{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="sm:col-span-4 flex flex-col justify-between gap-3 sm:border-l sm:border-[#D6D0C4] sm:pl-4">
                                <div>
                                  <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                                    Verified Outcome
                                  </h4>
                                  <p className="mt-1.5 font-serif text-sm italic text-[#1C1917]">
                                    {work.outcome}
                                  </p>
                                </div>

                                {work.href ? (
                                  <a
                                    href={work.href}
                                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#9A3412] underline decoration-[#9A3412]/40 underline-offset-4 hover:decoration-[#9A3412]"
                                  >
                                    <span>
                                      {work.linkLabel ?? 'Read Monograph'}
                                    </span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Monograph / Essays Index */}
            <div
              data-inspect-label="EssaysIndex"
              className="mt-10 border-t border-[#D6D0C4] pt-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                  {essaysHeading}
                </h2>
                <FileText className="h-3.5 w-3.5 text-[#9A3412]" />
              </div>

              <ul className="mt-3 divide-y divide-[#D6D0C4]">
                {essays.map((essay) => (
                  <li key={essay.title}>
                    <a
                      href={essay.href}
                      className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between text-sm transition-colors hover:text-[#9A3412]"
                    >
                      <span className="font-serif text-base text-[#1C1917] group-hover:text-[#9A3412]">
                        {essay.title}
                      </span>
                      <span className="inline-flex items-center gap-3 font-mono text-[11px] text-[#57534E]">
                        <span>{essay.date}</span>
                        <span>·</span>
                        <span>{essay.readingTime}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-[#9A3412] opacity-70 group-hover:opacity-100" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        {/* Editorial Colophon Footer */}
        <footer
          data-inspect-label="ColophonFooter"
          className="mt-12 border-t border-[#D6D0C4] pt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[#57534E]"
        >
          <span className="font-serif italic">{colophonNote}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
            {authorName} · Archive
          </span>
        </footer>
      </div>
    </div>
  );
}

export default EditorialPortfolio;
