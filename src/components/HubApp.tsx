import {
  Component,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  Check,
  Code2,
  Copy,
  Eye,
  Folder,
  Globe,
  Layers,
  Lock,
  Menu,
  Monitor,
  RotateCcw,
  Scan,
  Smartphone,
  Sparkles,
  Tablet,
  Terminal,
  X,
} from 'lucide-react';
import { InspectProvider } from './InspectBox';
import {
  getAllTemplates,
  type TemplateCategory,
  type TemplateEntry,
} from '../templates/registry';

type CategoryFilter = 'All' | TemplateCategory;
type WorkspaceTab = 'preview' | 'raw' | 'prompt';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const CATEGORIES: readonly CategoryFilter[] = [
  'All',
  'Portfolio',
  'Web',
  'Analytics',
  'Infrastructure',
  'Logistics',
];

const DEFAULT_BASE_URL = 'https://ui.marthin.web.id';

interface PreviewErrorBoundaryProps {
  templateName: string;
  children: ReactNode;
}

interface PreviewErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  state: PreviewErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown render error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Template preview failed to render:', error, info);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-rose-500/25 bg-zinc-950 p-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-medium text-zinc-100">
            Failed to render {this.props.templateName}
          </h3>
          <p className="mt-1.5 max-w-md font-mono text-xs text-zinc-400">
            {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry Preview
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

export default function HubApp() {
  const templates = useMemo(() => getAllTemplates(), []);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    const preferred = templates.find((t) => t.meta.slug === 'glass-portfolio');
    return preferred?.meta.slug ?? templates[0]?.meta.slug ?? '';
  });
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASE_URL);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('preview');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [inspect, setInspect] = useState<boolean>(false);

  const [targetDir, setTargetDir] = useState<string>('');
  const [instruction, setInstruction] = useState<string>('');
  const [strictVerbatim, setStrictVerbatim] = useState<boolean>(true);
  const [bearerAuth, setBearerAuth] = useState<boolean>(false);

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
    setTargetDir(activeTemplate.meta.targetDir);
    setInstruction(activeTemplate.meta.defaultInstruction);
  }, [activeTemplate?.meta.slug]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const cleanBaseUrl = useMemo(() => {
    const trimmed = baseUrl.trim().replace(/\/+$/, '');
    return trimmed || DEFAULT_BASE_URL;
  }, [baseUrl]);

  const rawManifestUrl = activeTemplate
    ? `${cleanBaseUrl}/r/${activeTemplate.meta.slug}.md`
    : '';

  const oneLinePrompt = useMemo(() => {
    if (!activeTemplate) return '';
    const authFlag = bearerAuth
      ? ' -H "Authorization: Bearer $UI_HUB_TOKEN"'
      : '';
    const curlCmd = `curl -s${authFlag} ${rawManifestUrl}`;
    const cleanDir =
      targetDir.replace(/\s+/g, ' ').trim() || activeTemplate.meta.targetDir;
    const cleanInstruction =
      instruction.replace(/\s+/g, ' ').trim() ||
      activeTemplate.meta.defaultInstruction;

    if (strictVerbatim) {
      return `Run \`${curlCmd}\`, write every file verbatim to \`${cleanDir}\` without altering colors, typography, border radius, or layout geometry, and wire data only via component props: ${cleanInstruction}`;
    }
    return `Run \`${curlCmd}\` to inspect the template manifest, write the components into \`${cleanDir}\` adapting styling as needed, and wire data via component props: ${cleanInstruction}`;
  }, [
    activeTemplate,
    bearerAuth,
    instruction,
    rawManifestUrl,
    strictVerbatim,
    targetDir,
  ]);

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

          {/* Base URL input */}
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
              placeholder={DEFAULT_BASE_URL}
              spellCheck={false}
              className="h-8 w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none sm:w-64"
            />
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

                  {/* 3 Workspace Tabs */}
                  <div
                    role="tablist"
                    aria-label="Workspace views"
                    className="inline-flex w-full shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 p-1 sm:w-auto"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'preview'}
                      onClick={() => setActiveTab('preview')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:flex-initial ${
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
                      aria-selected={activeTab === 'raw'}
                      onClick={() => setActiveTab('raw')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:flex-initial ${
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
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:flex-initial ${
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

                  {/* Preview Stage */}
                  <div className="flex-1 overflow-auto bg-[#0E0E11] p-3 sm:p-5 lg:p-6">
                    <div
                      data-inspect-mode={inspect ? 'true' : 'false'}
                      style={{ width: viewportWidthStyle, maxWidth: '100%' }}
                      className={`mx-auto transition-[width] duration-300 ease-out ${
                        viewport === 'desktop'
                          ? 'rounded-xl border border-zinc-800/80 shadow-xl'
                          : 'overflow-hidden rounded-2xl border-2 border-zinc-700/80 shadow-2xl ring-1 ring-white/5'
                      }`}
                    >
                      <PreviewErrorBoundary
                        key={activeTemplate.meta.slug}
                        templateName={activeTemplate.meta.name}
                      >
                        <InspectProvider value={inspect}>
                          <activeTemplate.Preview inspect={inspect} />
                        </InspectProvider>
                      </PreviewErrorBoundary>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Agent Raw */}
              {activeTab === 'raw' && (
                <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6">
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
                        onClick={() =>
                          triggerCopy('raw-md', activeTemplate.markdown)
                        }
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
                      <code>{activeTemplate.markdown}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 3: 1-Line Prompt */}
              {activeTab === 'prompt' && (
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                  <div className="mx-auto max-w-4xl space-y-5">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-sky-400" />
                        <h3 className="text-sm font-medium text-zinc-100">
                          Agent Prompt Builder
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="prompt-target-dir"
                            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-300"
                          >
                            <Folder className="h-3.5 w-3.5 text-zinc-500" />
                            Target Directory
                          </label>
                          <input
                            id="prompt-target-dir"
                            type="text"
                            value={targetDir}
                            onChange={(e) => setTargetDir(e.target.value)}
                            className="w-full rounded-lg border border-zinc-800 bg-[#0A0A0B] px-3 py-2 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                          />
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

                        <div className="grid gap-3 pt-1 sm:grid-cols-2">
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
