import { useState } from 'react';
import { ArrowLeft, Scan, X } from 'lucide-react';
import { InspectProvider } from './InspectBox';
import { getTemplateBySlug } from '../templates/registry';

export interface TemplateFullscreenPreviewProps {
  slug: string;
}

export default function TemplateFullscreenPreview({
  slug,
}: TemplateFullscreenPreviewProps) {
  const template = getTemplateBySlug(slug);
  const [inspect, setInspect] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] p-6 text-center text-zinc-200">
        <p className="text-sm text-zinc-400">Template not found.</p>
        <a
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Hub</span>
        </a>
      </div>
    );
  }

  return (
    <div
      data-inspect-mode={inspect ? 'true' : 'false'}
      className="min-h-screen w-full"
    >
      <InspectProvider value={inspect}>
        <template.Preview inspect={inspect} />
      </InspectProvider>

      {showControls && (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-zinc-800/90 bg-zinc-950/85 px-2 py-1.5 text-xs text-zinc-200 shadow-2xl backdrop-blur-md">
          <a
            href="/"
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
