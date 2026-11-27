import {
  Component,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw, Scan, X } from 'lucide-react';
import { InspectProvider } from './InspectBox';
import {
  buildStageStyleAndAttrs,
  createDefaultCustomization,
  hasActiveCustomization,
  parseCustomizationParams,
} from '../templates/customize';
import {
  getTemplateBySlug,
  type TemplateCustomization,
} from '../templates/registry';

export interface TemplateFullscreenPreviewProps {
  slug: string;
}

const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
const HUB_HOME_HREF = BASE_PATH ? `${BASE_PATH}/` : '/';

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

export default function TemplateFullscreenPreview({
  slug,
}: TemplateFullscreenPreviewProps) {
  const template = getTemplateBySlug(slug);
  const [isEmbedded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('embedded') === '1';
  });
  const [inspect, setInspect] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('inspect') === '1';
  });
  const [customization, setCustomization] = useState<TemplateCustomization>(
    () => {
      if (typeof window === 'undefined') {
        return createDefaultCustomization(template?.meta);
      }
      return parseCustomizationParams(window.location.search, template?.meta);
    },
  );
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'ui-hub:set-inspect') {
        setInspect(Boolean(event.data.inspect));
      } else if (
        event.data.type === 'ui-hub:set-customization' &&
        event.data.customization &&
        typeof event.data.customization === 'object'
      ) {
        const incoming = event.data.customization as TemplateCustomization;
        if (incoming.tokens && typeof incoming.tokens === 'object') {
          setCustomization({
            tokens: { ...incoming.tokens },
            copy:
              incoming.copy && typeof incoming.copy === 'object'
                ? { ...incoming.copy }
                : {},
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    if (isEmbedded && window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: 'ui-hub:preview-ready' },
        window.location.origin,
      );
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [isEmbedded]);

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] p-6 text-center text-zinc-200">
        <p className="text-sm text-zinc-400">Template not found.</p>
        <a
          href={HUB_HOME_HREF}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Hub</span>
        </a>
      </div>
    );
  }

  const { style, dataAttrs } = buildStageStyleAndAttrs(
    customization,
    template.meta.accentFamily,
  );
  const isCustomized = hasActiveCustomization(customization, template.meta);

  const handleResetCustomization = () => {
    setCustomization(createDefaultCustomization(template.meta));
    if (typeof window !== 'undefined') {
      const nextUrl = new URL(window.location.href);
      const inspectParam = nextUrl.searchParams.get('inspect');
      nextUrl.search = inspectParam
        ? `?inspect=${encodeURIComponent(inspectParam)}`
        : '';
      window.history.replaceState({}, '', nextUrl.toString());
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div
        data-inspect-mode={inspect ? 'true' : 'false'}
        style={style}
        {...dataAttrs}
        className="min-h-screen w-full"
      >
        <PreviewErrorBoundary
          key={template.meta.slug}
          templateName={template.meta.name}
        >
          <InspectProvider value={inspect}>
            <template.Preview
              inspect={inspect}
              customization={customization}
            />
          </InspectProvider>
        </PreviewErrorBoundary>
      </div>

      {!isEmbedded && showControls && (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-zinc-800/90 bg-zinc-950/85 px-2 py-1.5 text-xs text-zinc-200 shadow-2xl backdrop-blur-md">
          <a
            href={HUB_HOME_HREF}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Hub</span>
          </a>

          <span aria-hidden="true" className="h-3.5 w-px bg-zinc-800" />

          <button
            type="button"
            role="switch"
            aria-checked={inspect}
            onClick={() => setInspect((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition ${
              inspect
                ? 'bg-sky-500/20 text-sky-300'
                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Inspect</span>
          </button>

          {isCustomized && (
            <>
              <span aria-hidden="true" className="h-3.5 w-px bg-zinc-800" />
              <button
                type="button"
                onClick={handleResetCustomization}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-amber-300 transition hover:bg-amber-500/15 hover:text-amber-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Custom</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowControls(false)}
            aria-label="Hide floating preview controls"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
