import { serializeCustomizationParams } from './customize';
import type { TemplateCustomization, TemplateMeta } from './types';

function stripTrailingSlashes(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/+$/, '');
}

export function hasConfiguredHubToken(token: string | undefined): boolean {
  return Boolean((token ?? '').trim());
}

export interface ResolveBaseUrlOptions {
  baseUrl: string;
  envBaseUrl?: string;
  detectedOrigin?: string;
  fallbackOrigin?: string;
}

export function resolveBaseUrl(options: ResolveBaseUrlOptions): string {
  return (
    stripTrailingSlashes(options.baseUrl) ||
    stripTrailingSlashes(options.envBaseUrl) ||
    stripTrailingSlashes(options.detectedOrigin) ||
    stripTrailingSlashes(options.fallbackOrigin) ||
    ''
  );
}

export function buildRawManifestUrl(cleanBaseUrl: string, slug: string): string {
  return `${stripTrailingSlashes(cleanBaseUrl)}/r/${slug}.md`;
}

export interface BuildPreviewHrefOptions {
  basePath: string;
  slug?: string;
  customization?: TemplateCustomization;
  meta?: TemplateMeta;
}

export function buildPreviewHref(options: BuildPreviewHrefOptions): string {
  const cleanBasePath = stripTrailingSlashes(options.basePath);
  if (!options.slug) {
    return cleanBasePath ? `${cleanBasePath}/` : '/';
  }

  const params =
    options.customization && options.meta
      ? serializeCustomizationParams(options.customization, options.meta).toString()
      : '';

  return `${cleanBasePath}/preview/${options.slug}/${params ? `?${params}` : ''}`;
}

export interface BuildOneLinePromptOptions {
  rawManifestUrl: string;
  targetDir: string;
  defaultTargetDir?: string;
  instruction: string;
  defaultInstruction: string;
  strictVerbatim: boolean;
  bearerAuth: boolean;
  customClause?: string;
}

const AUTO_DETECT_TARGET_PHRASE =
  "into the appropriate components directory matching this repository's existing folder structure";

export function buildOneLinePrompt(options: BuildOneLinePromptOptions): string {
  const authFlag = options.bearerAuth
    ? ' -H "Authorization: Bearer $UI_HUB_TOKEN"'
    : '';
  const curlCmd = `curl -s${authFlag} ${options.rawManifestUrl}`;
  const cleanDir = options.targetDir.replace(/\s+/g, ' ').trim();
  const cleanInstruction =
    options.instruction.replace(/\s+/g, ' ').trim() ||
    options.defaultInstruction;
  const cleanClause = (options.customClause ?? '').trim();
  const strictTargetPhrase = cleanDir
    ? `to \`${cleanDir}\``
    : AUTO_DETECT_TARGET_PHRASE;
  const adaptTargetPhrase = cleanDir
    ? `into \`${cleanDir}\``
    : AUTO_DETECT_TARGET_PHRASE;

  if (options.strictVerbatim) {
    if (cleanClause) {
      return `Run \`${curlCmd}\`, write every file verbatim ${strictTargetPhrase} preserving layout geometry while applying these customizations: ${cleanClause}, and wire data only via component props: ${cleanInstruction}`;
    }
    return `Run \`${curlCmd}\`, write every file verbatim ${strictTargetPhrase} without altering colors, typography, border radius, or layout geometry, and wire data only via component props: ${cleanInstruction}`;
  }

  if (cleanClause) {
    return `Run \`${curlCmd}\` to inspect the template manifest, write the components ${adaptTargetPhrase} adapting styling as needed while applying these customizations: ${cleanClause}, and wire data via component props: ${cleanInstruction}`;
  }
  return `Run \`${curlCmd}\` to inspect the template manifest, write the components ${adaptTargetPhrase} adapting styling as needed, and wire data via component props: ${cleanInstruction}`;
}
