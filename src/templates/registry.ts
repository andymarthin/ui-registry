import type { ComponentType } from 'react';
import { generateTemplateMarkdown } from './markdown';
import type {
  TemplateEntry,
  TemplateFile,
  TemplateMeta,
  TemplatePreviewProps,
} from './types';

export * from './types';

const PREFERRED_ORDER = [
  'glass-portfolio',
  'saas-landing',
  'dev-portfolio',
  'homelab-ops',
  'saas-analytics',
  'logistics-hub',
];

const metaModules = import.meta.glob<{ meta: TemplateMeta }>('./*/meta.ts', {
  eager: true,
});

const previewModules = import.meta.glob<{
  default: ComponentType<TemplatePreviewProps>;
}>('./*/Preview.tsx', { eager: true });

const rawFileModules = import.meta.glob<string>('./*/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function extractSlugAndFilename(
  modulePath: string,
): { slug: string; filename: string } | null {
  const match = /^\.\/([^/]+)\/([^/]+)$/.exec(modulePath);
  if (!match) return null;
  return { slug: match[1], filename: match[2] };
}

function buildRegistry(): TemplateEntry[] {
  const metasBySlug = new Map<string, TemplateMeta>();
  for (const [path, mod] of Object.entries(metaModules)) {
    const parsed = extractSlugAndFilename(path);
    if (parsed && mod?.meta) {
      metasBySlug.set(parsed.slug, mod.meta);
    }
  }

  const previewsBySlug = new Map<
    string,
    ComponentType<TemplatePreviewProps>
  >();
  for (const [path, mod] of Object.entries(previewModules)) {
    const parsed = extractSlugAndFilename(path);
    if (parsed && mod?.default) {
      previewsBySlug.set(parsed.slug, mod.default);
    }
  }

  const rawFilesBySlug = new Map<
    string,
    Array<{ filename: string; content: string }>
  >();
  for (const [path, content] of Object.entries(rawFileModules)) {
    const parsed = extractSlugAndFilename(path);
    if (!parsed) continue;
    if (parsed.filename === 'Preview.tsx') continue;
    const list = rawFilesBySlug.get(parsed.slug) ?? [];
    list.push({ filename: parsed.filename, content });
    rawFilesBySlug.set(parsed.slug, list);
  }

  const entries: TemplateEntry[] = [];

  for (const [slug, meta] of metasBySlug.entries()) {
    const Preview = previewsBySlug.get(slug);
    if (!Preview) continue;

    const normalizedTargetDir = meta.targetDir.replace(/\/+$/, '');
    const rawList = rawFilesBySlug.get(slug) ?? [];
    const files: TemplateFile[] = rawList
      .slice()
      .sort((a, b) => a.filename.localeCompare(b.filename))
      .map((item) => ({
        filename: item.filename,
        targetPath: `${normalizedTargetDir}/${item.filename}`,
        content: item.content,
      }));

    entries.push({
      meta,
      Preview,
      files,
      markdown: generateTemplateMarkdown(meta, files),
    });
  }

  entries.sort((a, b) => {
    const aIdx = PREFERRED_ORDER.indexOf(a.meta.slug);
    const bIdx = PREFERRED_ORDER.indexOf(b.meta.slug);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.meta.slug.localeCompare(b.meta.slug);
  });

  return entries;
}

const REGISTRY: TemplateEntry[] = buildRegistry();

export function getAllTemplates(): TemplateEntry[] {
  return REGISTRY;
}

export function getTemplateBySlug(slug: string): TemplateEntry | undefined {
  return REGISTRY.find((entry) => entry.meta.slug === slug);
}
