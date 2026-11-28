import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Folder,
  Globe,
  Layers,
  Lock,
  Menu,
  Monitor,
  RotateCcw,
  Scan,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  Terminal,
  X,
} from 'lucide-react';
import {
  buildCustomizationPromptClause,
  countActiveCustomizations,
  createDefaultCustomization,
} from '../templates/customize';
import { generateDesignGuideMarkdown } from '../templates/design-guide';
import {
  matchThemeScheme,
  resolveEffectiveDesignSchema,
} from '../templates/design-schema';
import { generateTemplateMarkdown } from '../templates/markdown';
import {
  buildDesignGuideUrl,
  buildOneLinePrompt,
  buildPreviewHref,
  buildRawManifestUrl,
  resolveBaseUrl,
} from '../templates/prompt';
import {
  getAllTemplates,
  type TemplateCategory,
  type TemplateCustomization,
  type TemplateEntry,
} from '../templates/registry';
import type { DesignGuideTarget } from '../templates/types';
import CustomizeMenu from './CustomizeMenu';

type CategoryFilter = 'All' | TemplateCategory;
type WorkspaceTab = 'preview' | 'design' | 'raw' | 'prompt';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const CATEGORIES: readonly CategoryFilter[] = [
  'All',
  'Portfolio',
  'Web',
  'Analytics',
  'Infrastructure',
  'Logistics',
];

const ENV_BASE_URL = (import.meta.env.PUBLIC_HUB_URL ?? '')
  .trim()
  .replace(/\/+$/, '');
const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
const REPO_URL =
  (import.meta.env.PUBLIC_REPO_URL ?? '').trim() ||
  'https://github.com/andymarthin/ui-registry';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to textarea copy below
  }

  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return ok;
}

export interface HubAppProps {
  bearerAuthAvailable?: boolean;
}

export default function HubApp({ bearerAuthAvailable = false }: HubAppProps) {
  const templates = useMemo(() => getAllTemplates(), []);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    const preferred = templates.find((t) => t.meta.slug === 'glass-portfolio');
    return preferred?.meta.slug ?? templates[0]?.meta.slug ?? '';
  });
  const [baseUrl, setBaseUrl] = useState<string>(ENV_BASE_URL);
  const [detectedOrigin, setDetectedOrigin] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('preview');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [inspect, setInspect] = useState<boolean>(false);
  const [customizationsBySlug, setCustomizationsBySlug] = useState<
    Record<string, TemplateCustomization>
  >({});
  const [customizeOpen, setCustomizeOpen] = useState<boolean>(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  const [targetDir, setTargetDir] = useState<string>(() => {
    const preferred =
      templates.find((t) => t.meta.slug === 'glass-portfolio') ?? templates[0];
    return preferred?.meta.targetDir ?? '';
  });
  const [instruction, setInstruction] = useState<string>('');
  const [strictVerbatim, setStrictVerbatim] = useState<boolean>(true);
  const [bearerAuth, setBearerAuth] = useState<boolean>(false);
  const [designGuideTarget, setDesignGuideTarget] =
    useState<DesignGuideTarget>('root');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      All: templates.length,
      Portfolio: 0,
      Web: 0,
      Analytics: 0,
      Infrastructure: 0,
      Logistics: 0,
    };
    for (const entry of templates) {
      counts[entry.meta.category] += 1;
    }
    return counts;
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return templates;
    return templates.filter((entry) => entry.meta.category === activeCategory);
  }, [templates, activeCategory]);

  const activeTemplate: TemplateEntry | null = useMemo(() => {
    if (filteredTemplates.length === 0) return null;
    return (
      filteredTemplates.find((entry) => entry.meta.slug === selectedSlug) ??
      filteredTemplates[0] ??
      null
    );
  }, [filteredTemplates, selectedSlug]);

  useEffect(() => {
    if (activeTemplate && activeTemplate.meta.slug !== selectedSlug) {
      setSelectedSlug(activeTemplate.meta.slug);
    }
  }, [activeTemplate, selectedSlug]);

  useEffect(() => {
    if (!activeTemplate) return;
    setTargetDir((current) =>
      current.trim() === '' ? '' : activeTemplate.meta.targetDir,
    );
    setInstruction(activeTemplate.meta.defaultInstruction);
  }, [activeTemplate?.meta.slug]);

  const activeCustomization: TemplateCustomization = useMemo(() => {
    if (!activeTemplate) return createDefaultCustomization();
    return (
      customizationsBySlug[activeTemplate.meta.slug] ??
      createDefaultCustomization(activeTemplate.meta)
    );
  }, [activeTemplate, customizationsBySlug]);

  const activeCustomizationCount = useMemo(() => {
    if (!activeTemplate) return 0;
    return countActiveCustomizations(activeCustomization, activeTemplate.meta);
  }, [activeCustomization, activeTemplate]);

  const isCustomized = activeCustomizationCount > 0;

  const handleUpdateCustomization = (next: TemplateCustomization) => {
    if (!activeTemplate) return;
    setCustomizationsBySlug((prev) => ({
      ...prev,
      [activeTemplate.meta.slug]: next,
    }));
  };

  const handleResetCustomization = () => {
    if (!activeTemplate) return;
    setCustomizationsBySlug((prev) => {
      if (!(activeTemplate.meta.slug in prev)) return prev;
      const next = { ...prev };
      delete next[activeTemplate.meta.slug];
      return next;
    });
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!customizeOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCustomizeOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [customizeOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const autoBase = `${window.location.origin}${BASE_PATH}`;
    setDetectedOrigin(autoBase);
    if (!ENV_BASE_URL) {
      setBaseUrl((current) => current || autoBase);
    }
  }, []);

  const postInspectToIframe = (nextInspect: boolean) => {
    if (typeof window === 'undefined') return;
    previewIframeRef.current?.contentWindow?.postMessage(
      { type: 'ui-hub:set-inspect', inspect: nextInspect },
      window.location.origin,
    );
  };

  const postCustomizationToIframe = (
    nextCustomization: TemplateCustomization,
  ) => {
    if (typeof window === 'undefined') return;
    previewIframeRef.current?.contentWindow?.postMessage(
      {
        type: 'ui-hub:set-customization',
        customization: nextCustomization,
      },
      window.location.origin,
    );
  };

  useEffect(() => {
    if (activeTab !== 'preview' || !activeTemplate) return;
    postInspectToIframe(inspect);
  }, [inspect, activeTemplate?.meta.slug, activeTab]);

  useEffect(() => {
    if (activeTab !== 'preview' || !activeTemplate) return;
    postCustomizationToIframe(activeCustomization);
  }, [activeCustomization, activeTemplate?.meta.slug, activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'ui-hub:preview-ready'
      ) {
        postInspectToIframe(inspect);
        postCustomizationToIframe(activeCustomization);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [inspect, activeCustomization]);

  const cleanBaseUrl = useMemo(
    () =>
      resolveBaseUrl({
        baseUrl,
        envBaseUrl: ENV_BASE_URL,
        detectedOrigin,
        fallbackOrigin:
          typeof window !== 'undefined'
            ? `${window.location.origin}${BASE_PATH}`
            : '',
      }),
    [baseUrl, detectedOrigin],
  );

  const rawManifestUrl = activeTemplate
    ? buildRawManifestUrl(cleanBaseUrl, activeTemplate.meta.slug)
    : '';

  const designGuideUrl = activeTemplate
    ? buildDesignGuideUrl(cleanBaseUrl, activeTemplate.meta.slug)
    : '';

  const fullPageHref = useMemo(
    () =>
      buildPreviewHref({
        basePath: BASE_PATH,
        slug: activeTemplate?.meta.slug,
        customization: activeCustomization,
        meta: activeTemplate?.meta,
      }),
    [activeTemplate, activeCustomization],
  );

  const displayDesignGuide = useMemo(() => {
    if (!activeTemplate) return '';
    return isCustomized
      ? generateDesignGuideMarkdown(activeTemplate.meta, activeCustomization)
      : activeTemplate.designGuide;
  }, [activeTemplate, isCustomized, activeCustomization]);

  const effectiveDesignSchema = useMemo(() => {
    if (!activeTemplate) return null;
    return resolveEffectiveDesignSchema(
      activeTemplate.meta,
      activeCustomization,
    );
  }, [activeTemplate, activeCustomization]);

  const activeScheme = useMemo(
    () => matchThemeScheme(activeCustomization.tokens),
    [activeCustomization.tokens],
  );

  const displayMarkdown = useMemo(() => {
    if (!activeTemplate) return '';
    return isCustomized || designGuideTarget !== 'root'
      ? generateTemplateMarkdown(
          activeTemplate.meta,
          activeTemplate.files,
          activeCustomization,
          { designGuideTarget },
        )
      : activeTemplate.markdown;
  }, [activeTemplate, isCustomized, designGuideTarget, activeCustomization]);

  const oneLinePrompt = useMemo(() => {
    if (!activeTemplate) return '';
    const customClause = isCustomized
      ? buildCustomizationPromptClause(activeCustomization, activeTemplate.meta)
      : '';

    return buildOneLinePrompt({
      rawManifestUrl,
      targetDir,
      defaultTargetDir: activeTemplate.meta.targetDir,
      instruction,
      defaultInstruction: activeTemplate.meta.defaultInstruction,
      strictVerbatim,
      bearerAuth: bearerAuthAvailable && bearerAuth,
      customClause,
      designGuideTarget,
    });
  }, [
    activeTemplate,
    activeCustomization,
    isCustomized,
    bearerAuth,
    bearerAuthAvailable,
    designGuideTarget,
    instruction,
    rawManifestUrl,
    strictVerbatim,
    targetDir,
  ]);

  const handleDownloadDesignGuide = () => {
    if (!displayDesignGuide || typeof document === 'undefined') return;
    const blob = new Blob([displayDesignGuide], {
      type: 'text/markdown;charset=utf-8',
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'DESIGN.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  const triggerCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1800);
  };

  const handleSelectTemplate = (slug: string) => {
    setSelectedSlug(slug);
    setMobileMenuOpen(false);
  };

  const renderSidebarList = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
        <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
          Templates ({filteredTemplates.length})
        </span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
          aria-label="Close template drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav
        aria-label="Template catalog"
        className="flex-1 space-y-1.5 overflow-y-auto p-3"
      >
        {filteredTemplates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            No templates in {activeCategory}.
          </div>
        ) : (
          filteredTemplates.map((entry) => {
            const isSelected = activeTemplate?.meta.slug === entry.meta.slug;
            return (
              <button
                key={entry.meta.slug}
                type="button"
                onClick={() => handleSelectTemplate(entry.meta.slug)}
                className={`group w-full rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? 'border-zinc-600 bg-zinc-900/95 shadow-sm'
                    : 'border-zinc-800/70 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                    style={{
                      backgroundColor: entry.meta.swatchBg,
                      borderColor: entry.meta.swatchBorder,
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.meta.swatchAccent }}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-medium ${
                          isSelected ? 'text-zinc-50' : 'text-zinc-200'
                        }`}
                      >
                        {entry.meta.name}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                        {entry.meta.styleTag}
                      </span>
                      <span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        {entry.meta.category}
                      </span>
                    </div>

                    <div className="mt-2 truncate font-mono text-[11px] text-zinc-500 group-hover:text-zinc-400">
                      /r/{entry.meta.slug}.md
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </nav>
    </div>
  );

  const viewportWidthStyle =
    viewport === 'desktop'
      ? '100%'
      : viewport === 'tablet'
        ? '768px'
        : '390px';

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B] text-zinc-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-[#0A0A0B]/90 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 lg:hidden"
              aria-label="Open templates menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900 text-zinc-100 shadow-inner">
                <Layers className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                  UI Template Hub
                </h1>
                <p className="hidden text-[11px] text-zinc-500 sm:block">
                  Live multi-viewport previews &amp; agent manifests
                </p>
              </div>
            </div>
          </div>

          {/* Base URL input & repo link */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label
              htmlFor="hub-base-url"
              className="flex items-center gap-1.5 text-xs text-zinc-400"
            >
              <Globe className="h-3.5 w-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Base URL</span>
            </label>
            <input
              id="hub-base-url"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={
                ENV_BASE_URL ||
                detectedOrigin ||
                'Auto-detected from current host'
              }
              spellCheck={false}
              className="h-8 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none sm:w-64 sm:flex-initial"
            />
            <span
              aria-hidden="true"
              className="hidden h-4 w-px bg-zinc-800 sm:inline-block"
            />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source repository on GitHub"
              title="andymarthin/ui-registry on GitHub"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/70 md:w-auto md:px-2.5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span className="hidden md:inline">GitHub</span>
              <ExternalLink className="hidden h-3 w-3 text-zinc-500 md:inline" />
            </a>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-zinc-900 px-4 py-2 lg:px-6">
          {CATEGORIES.map((category) => {
            const count = categoryCounts[category];
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-zinc-600 bg-zinc-100 text-zinc-950'
                    : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                    active
                      ? 'bg-zinc-900/15 text-zinc-900'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Desktop Persistent Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-zinc-800/80 bg-[#0A0A0B] lg:block xl:w-80">
          {renderSidebarList()}
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col border-r border-zinc-800 bg-[#0A0A0B] shadow-2xl">
              {renderSidebarList()}
            </aside>
          </div>
        )}

        {/* Right Workspace */}
        <main className="flex min-w-0 flex-1 flex-col">
          {!activeTemplate ? (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
              Select a template to inspect its preview and agent manifest.
            </div>
          ) : (
            <>
              {/* Workspace Header */}
              <div className="border-b border-zinc-800/80 bg-zinc-950/60 px-4 py-4 lg:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border"
                        style={{
                          backgroundColor: activeTemplate.meta.swatchBg,
                          borderColor: activeTemplate.meta.swatchBorder,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: activeTemplate.meta.swatchAccent,
                          }}
                        />
                      </span>
                      <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                        {activeTemplate.meta.name}
                      </h2>
                      <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-300">
                        {activeTemplate.meta.styleFull}
                      </span>
                    </div>

                    <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
                      {activeTemplate.meta.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-medium text-zinc-500">
                        Dependencies:
                      </span>
                      {activeTemplate.meta.dependencies.length > 0 ? (
                        activeTemplate.meta.dependencies.map((dep) => (
                          <span
                            key={dep}
                            className="rounded-md border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 font-mono text-[11px] text-zinc-300"
                          >
                            {dep}
                          </span>
                        ))
                      ) : (
                        <span className="font-mono text-[11px] text-zinc-500">
                          None
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Workspace Tabs */}
                  <div
                    role="tablist"
                    aria-label="Workspace views"
                    className="inline-flex w-full shrink-0 flex-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-1 sm:w-auto sm:flex-nowrap"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'preview'}
                      onClick={() => setActiveTab('preview')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition sm:flex-initial ${
                        activeTab === 'preview'
                          ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Live Preview
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'design'}
                      onClick={() => setActiveTab('design')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition sm:flex-initial ${
                        activeTab === 'design'
                          ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Design Guide
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'raw'}
                      onClick={() => setActiveTab('raw')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition sm:flex-initial ${
                        activeTab === 'raw'
                          ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Agent Raw
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'prompt'}
                      onClick={() => setActiveTab('prompt')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition sm:flex-initial ${
                        activeTab === 'prompt'
                          ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      1-Line Prompt
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab 1: Live Preview */}
              {activeTab === 'preview' && (
                <div className="flex flex-1 flex-col">
                  {/* Preview Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-[#0A0A0B] px-4 py-2.5 lg:px-6">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
                        <button
                          type="button"
                          onClick={() => setViewport('desktop')}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            viewport === 'desktop'
                              ? 'bg-zinc-800 text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Monitor className="h-3.5 w-3.5" />
                          <span>Desktop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewport('tablet')}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            viewport === 'tablet'
                              ? 'bg-zinc-800 text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Tablet className="h-3.5 w-3.5" />
                          <span>Tablet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewport('mobile')}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                            viewport === 'mobile'
                              ? 'bg-zinc-800 text-zinc-100'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>Mobile</span>
                        </button>
                      </div>

                      <span className="hidden font-mono text-[11px] text-zinc-500 sm:inline">
                        {viewportWidthStyle}
                      </span>
                    </div>

                    {/* Right Toolbar Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        aria-expanded={customizeOpen}
                        onClick={() => setCustomizeOpen((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          customizeOpen || isCustomized
                            ? 'border-sky-500/50 bg-sky-950/50 text-sky-300'
                            : 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100'
                        }`}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Customize</span>
                        {activeCustomizationCount > 0 && (
                          <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-sky-500/20 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-sky-300">
                            {activeCustomizationCount}
                          </span>
                        )}
                      </button>

                      <a
                        href={fullPageHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Full Page</span>
                      </a>

                      {/* Inspect Templates Toggle */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={inspect}
                        onClick={() => setInspect((prev) => !prev)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          inspect
                            ? 'border-sky-500/50 bg-sky-950/50 text-sky-300'
                            : 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                        }`}
                      >
                        <Scan className="h-3.5 w-3.5" />
                        <span>Inspect Templates</span>
                        <span
                          aria-hidden="true"
                          className={`ml-0.5 inline-flex h-4 w-7 items-center rounded-full p-0.5 transition ${
                            inspect ? 'bg-sky-500' : 'bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`h-3 w-3 rounded-full bg-white transition-transform ${
                              inspect ? 'translate-x-3' : 'translate-x-0'
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Preview Stage + Customize Panel */}
                  <div className="relative flex min-h-0 flex-1">
                    <div className="min-w-0 flex-1 overflow-auto bg-[#0E0E11] p-3 sm:p-5 lg:p-6">
                      <div
                        style={{ width: viewportWidthStyle, maxWidth: '100%' }}
                        className={`mx-auto overflow-hidden transition-[width] duration-300 ease-out ${
                          viewport === 'desktop'
                            ? 'rounded-xl border border-zinc-800/80 shadow-xl'
                            : 'rounded-2xl border-2 border-zinc-700/80 shadow-2xl ring-1 ring-white/5'
                        }`}
                      >
                        <iframe
                          ref={previewIframeRef}
                          key={activeTemplate.meta.slug}
                          src={`${BASE_PATH}/preview/${activeTemplate.meta.slug}/?embedded=1`}
                          title={`${activeTemplate.meta.name} live preview`}
                          onLoad={() => {
                            postInspectToIframe(inspect);
                            postCustomizationToIframe(activeCustomization);
                          }}
                          className={`block w-full border-0 bg-[#0A0A0B] ${
                            viewport === 'mobile'
                              ? 'h-[780px]'
                              : viewport === 'tablet'
                                ? 'h-[820px]'
                                : 'h-[calc(100vh-14.5rem)] min-h-[640px]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Desktop / Large Side Panel */}
                    {customizeOpen && (
                      <aside className="hidden w-80 shrink-0 border-l border-zinc-800/80 bg-[#0A0A0B] lg:flex lg:flex-col xl:w-96">
                        <CustomizeMenu
                          template={activeTemplate}
                          customization={activeCustomization}
                          activeCount={activeCustomizationCount}
                          onChange={handleUpdateCustomization}
                          onReset={handleResetCustomization}
                          onClose={() => setCustomizeOpen(false)}
                          onJumpToTab={(tab) => setActiveTab(tab)}
                        />
                      </aside>
                    )}

                    {/* Smaller Screen Slide-Over Drawer */}
                    {customizeOpen && (
                      <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
                        <div
                          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                          onClick={() => setCustomizeOpen(false)}
                          aria-hidden="true"
                        />
                        <aside className="relative z-10 flex h-full w-80 max-w-[90vw] flex-col border-l border-zinc-800 bg-[#0A0A0B] shadow-2xl">
                          <CustomizeMenu
                            template={activeTemplate}
                            customization={activeCustomization}
                            activeCount={activeCustomizationCount}
                            onChange={handleUpdateCustomization}
                            onReset={handleResetCustomization}
                            onClose={() => setCustomizeOpen(false)}
                            onJumpToTab={(tab) => {
                              setCustomizeOpen(false);
                              setActiveTab(tab);
                            }}
                          />
                        </aside>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Design Guide */}
              {activeTab === 'design' && effectiveDesignSchema && (
                <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
                  {isCustomized && (
                    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sky-500/30 bg-sky-950/25 px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 font-medium text-sky-300">
                          <SlidersHorizontal className="h-3 w-3" />
                          <span>Customized ({activeCustomizationCount})</span>
                        </span>
                        {activeScheme && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 font-mono text-[11px] text-zinc-200">
                            Scheme: {activeScheme.name}
                          </span>
                        )}
                        <span className="text-zinc-300">
                          Reflecting {activeCustomizationCount}{' '}
                          {activeCustomizationCount === 1
                            ? 'override'
                            : 'overrides'}{' '}
                          in DESIGN.md
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('preview');
                            setCustomizeOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          <span>Customize</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetCustomization}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Design Schema Overview */}
                  <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                              effectiveDesignSchema.mode === 'dark'
                                ? 'border-zinc-700 bg-zinc-900 text-zinc-200'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                            }`}
                          >
                            {effectiveDesignSchema.mode === 'dark'
                              ? 'Dark Mode'
                              : 'Light Mode'}
                          </span>
                          <span className="rounded-md border border-zinc-800 bg-[#0A0A0B] px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                            {effectiveDesignSchema.id} &middot; v
                            {effectiveDesignSchema.version}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
                          {effectiveDesignSchema.summary}
                        </p>
                      </div>
                    </div>

                    {/* Swatch Strip */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {[
                        {
                          label: 'Canvas',
                          value: effectiveDesignSchema.palette.canvas,
                        },
                        {
                          label: 'Surface',
                          value: effectiveDesignSchema.palette.surface,
                        },
                        {
                          label: 'Elevated',
                          value: effectiveDesignSchema.palette.surfaceElevated,
                        },
                        {
                          label: 'Text',
                          value: effectiveDesignSchema.palette.text,
                        },
                        {
                          label: 'Border',
                          value: effectiveDesignSchema.palette.border,
                        },
                        {
                          label: 'Accent',
                          value: effectiveDesignSchema.palette.accent,
                        },
                      ].map((swatch) => (
                        <div
                          key={swatch.label}
                          className="flex items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-[#0A0A0B] px-2.5 py-2"
                        >
                          <span
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 rounded-md border border-zinc-700/70"
                            style={{ backgroundColor: swatch.value }}
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-medium text-zinc-400">
                              {swatch.label}
                            </div>
                            <div className="truncate font-mono text-[11px] text-zinc-200">
                              {swatch.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 3 Metadata Cards */}
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-zinc-800/80 bg-[#0A0A0B] p-3">
                        <div className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                          Typography
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Display: </span>
                            <span>{effectiveDesignSchema.typography.display}</span>
                          </div>
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Mono: </span>
                            <span className="font-mono text-[11px]">
                              {effectiveDesignSchema.typography.mono}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-800/80 bg-[#0A0A0B] p-3">
                        <div className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                          Geometry
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Radius: </span>
                            <span>{effectiveDesignSchema.geometry.radius}</span>
                          </div>
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Border: </span>
                            <span>
                              {effectiveDesignSchema.geometry.borderStyle}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-800/80 bg-[#0A0A0B] p-3">
                        <div className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                          Elevation &amp; Motion
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Elevation: </span>
                            <span>{effectiveDesignSchema.elevation}</span>
                          </div>
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Motion: </span>
                            <span>{effectiveDesignSchema.motion}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw Design Guide Endpoint Bar */}
                  <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                        Design Guide Endpoint
                      </div>
                      <div className="mt-1 truncate font-mono text-xs text-zinc-200 sm:text-sm">
                        {designGuideUrl}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {!isCustomized && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('preview');
                            setCustomizeOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Customize</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          triggerCopy(
                            'design-curl',
                            `curl -s ${designGuideUrl} -o DESIGN.md`,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                      >
                        {copiedKey === 'design-curl' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Copied curl</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Copy curl -o DESIGN.md</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadDesignGuide}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                      >
                        <Download className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Download DESIGN.md</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          triggerCopy('design-md', displayDesignGuide)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-white"
                      >
                        {copiedKey === 'design-md' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Copied Markdown</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Markdown</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable DESIGN.md Content */}
                  <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
                      <span className="font-mono text-xs text-zinc-400">
                        /r/{activeTemplate.meta.slug}.design.md
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {effectiveDesignSchema.components.length} pattern(s)
                      </span>
                    </div>
                    <pre className="max-h-[60vh] overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
                      <code>{displayDesignGuide}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 3: Agent Raw */}
              {activeTab === 'raw' && (
                <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
                  {isCustomized && (
                    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sky-500/30 bg-sky-950/25 px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 font-medium text-sky-300">
                          <SlidersHorizontal className="h-3 w-3" />
                          <span>Customized ({activeCustomizationCount})</span>
                        </span>
                        <span className="text-zinc-300">
                          Showing customized manifest &middot;{' '}
                          {activeCustomizationCount}{' '}
                          {activeCustomizationCount === 1
                            ? 'override'
                            : 'overrides'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('preview');
                            setCustomizeOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          <span>Customize</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetCustomization}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                        Raw Endpoint
                      </div>
                      <div className="mt-1 truncate font-mono text-xs text-zinc-200 sm:text-sm">
                        {rawManifestUrl}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {!isCustomized && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('preview');
                            setCustomizeOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Customize</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          triggerCopy('raw-url', `curl -s ${rawManifestUrl}`)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                      >
                        {copiedKey === 'raw-url' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Copied curl</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Copy curl</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerCopy('raw-md', displayMarkdown)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-white"
                      >
                        {copiedKey === 'raw-md' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Copied Markdown</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Markdown</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
                      <span className="font-mono text-xs text-zinc-400">
                        /r/{activeTemplate.meta.slug}.md
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {activeTemplate.files.length} deliverable file(s)
                      </span>
                    </div>
                    <pre className="max-h-[65vh] overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-300">
                      <code>{displayMarkdown}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 4: 1-Line Prompt */}
              {activeTab === 'prompt' && (
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                  <div className="mx-auto max-w-4xl space-y-5">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-sky-400" />
                          <h3 className="text-sm font-medium text-zinc-100">
                            Agent Prompt Builder
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {isCustomized && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-300">
                              <SlidersHorizontal className="h-3 w-3" />
                              <span>
                                Customized ({activeCustomizationCount})
                              </span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('preview');
                              setCustomizeOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800"
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                            <span>Customize</span>
                          </button>
                          {isCustomized && (
                            <button
                              type="button"
                              onClick={handleResetCustomization}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#0A0A0B] px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reset</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <label
                              htmlFor="prompt-target-dir"
                              className="flex items-center gap-1.5 text-xs font-medium text-zinc-300"
                            >
                              <Folder className="h-3.5 w-3.5 text-zinc-500" />
                              Target Directory
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setTargetDir(
                                  targetDir.trim() === ''
                                    ? activeTemplate.meta.targetDir
                                    : '',
                                )
                              }
                              className="rounded-md border border-zinc-800 bg-[#0A0A0B] px-2 py-0.5 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100"
                            >
                              {targetDir.trim() === ''
                                ? 'Use default'
                                : 'Auto-detect'}
                            </button>
                          </div>
                          <input
                            id="prompt-target-dir"
                            type="text"
                            value={targetDir}
                            onChange={(e) => setTargetDir(e.target.value)}
                            placeholder={`Auto-detect project structure (default: ${activeTemplate.meta.targetDir})`}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0A0A0B] px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                          />
                          <p className="mt-1.5 text-[11px] text-zinc-500">
                            {targetDir.trim() === ''
                              ? "Auto-detect active — the agent will place files using your repository's existing folder structure."
                              : 'Edit to match your project structure, or click Auto-detect to let the agent choose.'}
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="prompt-instruction"
                            className="mb-1.5 block text-xs font-medium text-zinc-300"
                          >
                            API / Data Instruction
                          </label>
                          <textarea
                            id="prompt-instruction"
                            rows={3}
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0A0A0B] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                              <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                              Design Guide (DESIGN.md)
                            </span>
                            <span className="font-mono text-[11px] text-zinc-500">
                              {designGuideTarget === 'root'
                                ? 'DESIGN.md'
                                : designGuideTarget === 'targetDir'
                                  ? targetDir.trim()
                                    ? `${targetDir.trim().replace(/\/+$/, '')}/DESIGN.md`
                                    : 'DESIGN.md'
                                  : 'Skipped'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-zinc-800/80 bg-[#0A0A0B] p-1">
                            {(
                              [
                                { value: 'root', label: 'Project Root' },
                                { value: 'targetDir', label: 'Target Dir' },
                                { value: 'none', label: 'Skip' },
                              ] as const
                            ).map((option) => {
                              const active = designGuideTarget === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    setDesignGuideTarget(option.value)
                                  }
                                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                                    active
                                      ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                          <p className="mt-1.5 text-[11px] text-zinc-500">
                            Writes <code className="font-mono text-zinc-400">DESIGN.md</code> as the persistent design reference after install so future pages, modals, and forms match this template.
                          </p>
                        </div>

                        <div
                          className={`grid gap-3 pt-1 ${
                            bearerAuthAvailable ? 'sm:grid-cols-2' : ''
                          }`}
                        >
                          <button
                            type="button"
                            role="switch"
                            aria-checked={strictVerbatim}
                            onClick={() => setStrictVerbatim((v) => !v)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                              strictVerbatim
                                ? 'border-zinc-700 bg-zinc-900'
                                : 'border-zinc-800/80 bg-[#0A0A0B]'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-medium text-zinc-100">
                                Strict Verbatim Mode
                              </div>
                              <div className="mt-0.5 text-[11px] text-zinc-400">
                                Preserve exact colors, fonts, radius, and layout
                              </div>
                            </div>
                            <span
                              aria-hidden="true"
                              className={`ml-3 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
                                strictVerbatim ? 'bg-sky-500' : 'bg-zinc-700'
                              }`}
                            >
                              <span
                                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                  strictVerbatim
                                    ? 'translate-x-4'
                                    : 'translate-x-0'
                                }`}
                              />
                            </span>
                          </button>

                          {bearerAuthAvailable && (
                            <button
                              type="button"
                              role="switch"
                              aria-checked={bearerAuth}
                              onClick={() => setBearerAuth((v) => !v)}
                              className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                                bearerAuth
                                  ? 'border-zinc-700 bg-zinc-900'
                                  : 'border-zinc-800/80 bg-[#0A0A0B]'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-100">
                                  <Lock className="h-3 w-3 text-zinc-400" />
                                  Bearer Auth Header
                                </div>
                                <div className="mt-0.5 font-mono text-[11px] text-zinc-400">
                                  Authorization: Bearer $UI_HUB_TOKEN
                                </div>
                              </div>
                              <span
                                aria-hidden="true"
                                className={`ml-3 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
                                  bearerAuth ? 'bg-sky-500' : 'bg-zinc-700'
                                }`}
                              >
                                <span
                                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                    bearerAuth
                                      ? 'translate-x-4'
                                      : 'translate-x-0'
                                  }`}
                                />
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Generated 1-Line Prompt Output */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-medium text-zinc-200">
                            Ready-to-Paste 1-Line Prompt
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Paste directly into Claude Code, Codex, Cursor, or
                            any terminal agent
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => triggerCopy('prompt', oneLinePrompt)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 transition hover:bg-white"
                        >
                          {copiedKey === 'prompt' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copied Prompt</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-[#0A0A0B] p-3.5 font-mono text-xs leading-relaxed break-words text-zinc-200">
                        {oneLinePrompt}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
