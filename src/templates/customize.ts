import type { CSSProperties } from 'react';
import { applyThemeScheme } from './design-schema';
import type {
  DensityChoice,
  FontFamilyChoice,
  RadiusScale,
  TemplateAccentFamily,
  TemplateCustomization,
  TemplateMeta,
  TemplateThemeTokens,
} from './types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_THEME_TOKENS: TemplateThemeTokens = {
  accentColor: 'default',
  radiusScale: 'default',
  fontFamily: 'default',
  density: 'default',
};

export interface AccentPreset {
  id: string;
  label: string;
  value: string;
  swatch: string;
}

export const ACCENT_PRESETS: readonly AccentPreset[] = [
  { id: 'default', label: 'Default', value: 'default', swatch: '#71717A' },
  { id: 'sky', label: 'Sky', value: '#38BDF8', swatch: '#38BDF8' },
  { id: 'violet', label: 'Violet', value: '#8B5CF6', swatch: '#8B5CF6' },
  { id: 'emerald', label: 'Emerald', value: '#10B981', swatch: '#10B981' },
  { id: 'amber', label: 'Amber', value: '#F59E0B', swatch: '#F59E0B' },
  { id: 'rose', label: 'Rose', value: '#F43F5E', swatch: '#F43F5E' },
  { id: 'cyan', label: 'Cyan', value: '#06B6D4', swatch: '#06B6D4' },
  { id: 'orange', label: 'Orange', value: '#F97316', swatch: '#F97316' },
] as const;

export const RADIUS_OPTIONS: ReadonlyArray<{ value: RadiusScale; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
] as const;

export const FONT_OPTIONS: ReadonlyArray<{ value: FontFamilyChoice; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
] as const;

export const DENSITY_OPTIONS: ReadonlyArray<{ value: DensityChoice; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
] as const;

const VALID_RADIUS = new Set<RadiusScale>(RADIUS_OPTIONS.map((o) => o.value));
const VALID_FONT = new Set<FontFamilyChoice>(FONT_OPTIONS.map((o) => o.value));
const VALID_DENSITY = new Set<DensityChoice>(DENSITY_OPTIONS.map((o) => o.value));

function isCustomAccentActive(accentColor: string | undefined): accentColor is string {
  return typeof accentColor === 'string' && accentColor !== 'default' && HEX_COLOR_RE.test(accentColor);
}

export function createDefaultCustomization(meta?: TemplateMeta): TemplateCustomization {
  const copy: Record<string, string> = {};
  for (const field of meta?.customFields ?? []) {
    copy[field.key] = field.defaultValue;
  }

  return {
    tokens: { ...DEFAULT_THEME_TOKENS },
    copy,
  };
}

export function getEffectiveCopyOverrides(
  customization: TemplateCustomization | undefined,
  meta: TemplateMeta,
): Array<{ key: string; label: string; value: string }> {
  if (!customization?.copy || !meta.customFields?.length) {
    return [];
  }

  const overrides: Array<{ key: string; label: string; value: string }> = [];
  for (const field of meta.customFields) {
    const raw = customization.copy[field.key];
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (trimmed.length === 0) continue;
    if (trimmed === field.defaultValue.trim()) continue;
    overrides.push({
      key: field.key,
      label: field.label,
      value: trimmed,
    });
  }

  return overrides;
}

export function countActiveCustomizations(
  customization: TemplateCustomization | undefined,
  meta: TemplateMeta,
): number {
  if (!customization) return 0;

  let count = 0;
  const { tokens } = customization;

  if (isCustomAccentActive(tokens.accentColor)) count += 1;
  if (tokens.radiusScale !== 'default' && VALID_RADIUS.has(tokens.radiusScale)) count += 1;
  if (tokens.fontFamily !== 'default' && VALID_FONT.has(tokens.fontFamily)) count += 1;
  if (tokens.density !== 'default' && VALID_DENSITY.has(tokens.density)) count += 1;

  count += getEffectiveCopyOverrides(customization, meta).length;
  return count;
}

export function hasActiveCustomization(
  customization: TemplateCustomization | undefined,
  meta: TemplateMeta,
): boolean {
  return countActiveCustomizations(customization, meta) > 0;
}

export function buildCustomizationPromptClause(
  customization: TemplateCustomization | undefined,
  meta: TemplateMeta,
): string {
  if (!customization || !hasActiveCustomization(customization, meta)) {
    return '';
  }

  const tokenParts: string[] = [];
  const { tokens } = customization;

  if (isCustomAccentActive(tokens.accentColor)) {
    tokenParts.push(`accent=${tokens.accentColor.toUpperCase()}`);
  }
  if (tokens.radiusScale !== 'default' && VALID_RADIUS.has(tokens.radiusScale)) {
    tokenParts.push(`radius=${tokens.radiusScale}`);
  }
  if (tokens.fontFamily !== 'default' && VALID_FONT.has(tokens.fontFamily)) {
    tokenParts.push(`font=${tokens.fontFamily}`);
  }
  if (tokens.density !== 'default' && VALID_DENSITY.has(tokens.density)) {
    tokenParts.push(`density=${tokens.density}`);
  }

  const copyOverrides = getEffectiveCopyOverrides(customization, meta);
  const sections: string[] = [];

  if (tokenParts.length > 0) {
    sections.push(tokenParts.join(', '));
  }

  if (copyOverrides.length > 0) {
    const propsBody = copyOverrides
      .map((item) => `${item.key}: ${JSON.stringify(item.value)}`)
      .join(', ');
    sections.push(`props={ ${propsBody} }`);
  }

  return sections.join('; ');
}

export function serializeCustomizationParams(
  customization: TemplateCustomization | undefined,
  meta: TemplateMeta,
): URLSearchParams {
  const params = new URLSearchParams();
  if (!customization) return params;

  const { tokens } = customization;

  if (isCustomAccentActive(tokens.accentColor)) {
    params.set('accent', tokens.accentColor.toUpperCase());
  }
  if (tokens.radiusScale !== 'default' && VALID_RADIUS.has(tokens.radiusScale)) {
    params.set('radius', tokens.radiusScale);
  }
  if (tokens.fontFamily !== 'default' && VALID_FONT.has(tokens.fontFamily)) {
    params.set('font', tokens.fontFamily);
  }
  if (tokens.density !== 'default' && VALID_DENSITY.has(tokens.density)) {
    params.set('density', tokens.density);
  }

  for (const override of getEffectiveCopyOverrides(customization, meta)) {
    params.set(`copy.${override.key}`, override.value);
  }

  return params;
}

export function parseCustomizationParams(
  search: string,
  meta?: TemplateMeta,
): TemplateCustomization {
  let result = createDefaultCustomization(meta);
  const params = new URLSearchParams(search);

  const schemeParam = params.get('scheme');
  if (schemeParam) {
    result = applyThemeScheme(result, schemeParam);
  }

  const accent = params.get('accent');
  if (accent && HEX_COLOR_RE.test(accent)) {
    result.tokens.accentColor = accent.toUpperCase();
  }

  const radius = params.get('radius') as RadiusScale | null;
  if (radius && VALID_RADIUS.has(radius)) {
    result.tokens.radiusScale = radius;
  }

  const font = params.get('font') as FontFamilyChoice | null;
  if (font && VALID_FONT.has(font)) {
    result.tokens.fontFamily = font;
  }

  const density = params.get('density') as DensityChoice | null;
  if (density && VALID_DENSITY.has(density)) {
    result.tokens.density = density;
  }

  const allowedKeys =
    meta?.customFields && meta.customFields.length > 0
      ? new Set(meta.customFields.map((field) => field.key))
      : null;

  for (const [paramKey, paramValue] of params.entries()) {
    if (!paramKey.startsWith('copy.')) continue;
    const fieldKey = paramKey.slice(5);
    if (!fieldKey) continue;
    if (allowedKeys && !allowedKeys.has(fieldKey)) continue;
    if (!allowedKeys && !/^[a-zA-Z0-9_.-]+$/.test(fieldKey)) continue;
    if (paramValue.trim().length === 0) continue;
    result.copy[fieldKey] = paramValue;
  }

  return result;
}

export function buildStageStyleAndAttrs(
  customization: TemplateCustomization | undefined,
  accentFamily?: TemplateAccentFamily,
): { style: CSSProperties; dataAttrs: Record<string, string | undefined> } {
  const tokens = customization?.tokens ?? DEFAULT_THEME_TOKENS;
  const hasAccent = isCustomAccentActive(tokens.accentColor);

  const style: CSSProperties & Record<string, string | undefined> = {};
  if (hasAccent) {
    style['--ui-custom-accent'] = tokens.accentColor.toUpperCase();
  }

  const dataAttrs: Record<string, string | undefined> = {
    'data-template-stage': 'true',
    'data-accent-family': accentFamily,
    'data-custom-accent': hasAccent ? 'true' : undefined,
    'data-custom-radius':
      tokens.radiusScale !== 'default' && VALID_RADIUS.has(tokens.radiusScale)
        ? tokens.radiusScale
        : undefined,
    'data-custom-font':
      tokens.fontFamily !== 'default' && VALID_FONT.has(tokens.fontFamily)
        ? tokens.fontFamily
        : undefined,
    'data-custom-density':
      tokens.density !== 'default' && VALID_DENSITY.has(tokens.density)
        ? tokens.density
        : undefined,
  };

  return { style, dataAttrs };
}
