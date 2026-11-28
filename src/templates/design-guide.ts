import { hasActiveCustomization } from './customize';
import { matchThemeScheme, resolveEffectiveDesignSchema } from './design-schema';
import type { DesignGuideTarget, TemplateCustomization, TemplateMeta } from './types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Resolves the target file path for DESIGN.md given a template targetDir and placement strategy.
 */
export function resolveDesignGuidePath(
  targetDir: string,
  target: DesignGuideTarget = 'root',
): string | null {
  if (target === 'none') {
    return null;
  }
  if (target === 'root') {
    return 'DESIGN.md';
  }
  const cleanDir = targetDir.replace(/\s+/g, ' ').trim().replace(/\/+$/, '');
  return cleanDir ? `${cleanDir}/DESIGN.md` : 'DESIGN.md';
}

function formatActiveOverridesSummary(
  customization: TemplateCustomization,
  meta: TemplateMeta,
): string[] {
  const { tokens } = customization;
  const parts: string[] = [];

  if (
    typeof tokens.accentColor === 'string' &&
    tokens.accentColor !== 'default' &&
    HEX_COLOR_RE.test(tokens.accentColor)
  ) {
    parts.push(`accent \`${tokens.accentColor.toUpperCase()}\``);
  }
  if (tokens.radiusScale !== 'default') {
    parts.push(`radius \`${tokens.radiusScale}\``);
  }
  if (tokens.fontFamily !== 'default') {
    parts.push(`font \`${tokens.fontFamily}\``);
  }
  if (tokens.density !== 'default') {
    parts.push(`density \`${tokens.density}\``);
  }

  const copyKeys = (meta.customFields ?? [])
    .filter((field) => {
      const raw = customization.copy?.[field.key];
      return typeof raw === 'string' && raw.trim().length > 0 && raw.trim() !== field.defaultValue.trim();
    })
    .map((field) => `\`${field.key}\``);

  if (copyKeys.length > 0) {
    parts.push(`copy overrides (${copyKeys.join(', ')})`);
  }

  return parts;
}

/**
 * Generates a standalone DESIGN.md specification for a template and optional customization.
 */
export function generateDesignGuideMarkdown(
  meta: TemplateMeta,
  customization?: TemplateCustomization,
): string {
  const schema = resolveEffectiveDesignSchema(meta, customization);
  const isCustomized = Boolean(customization) && hasActiveCustomization(customization, meta);
  const matchedScheme = customization ? matchThemeScheme(customization.tokens) : undefined;
  const overrideParts =
    isCustomized && customization ? formatActiveOverridesSummary(customization, meta) : [];

  const identityLines = [
    `- **Style:** ${meta.styleFull} (${meta.styleTag})`,
    `- **Surface Mode:** ${schema.mode}`,
    `- **Schema ID & Version:** \`${schema.id}\` (v${schema.version})`,
    `- **Source Template:** \`${meta.slug}\` (${meta.category})`,
    `- **Aesthetic Summary:** ${schema.summary}`,
  ];

  if (matchedScheme) {
    identityLines.push(
      `- **Applied Theme Scheme:** ${matchedScheme.name} (\`${matchedScheme.id}\`)`,
    );
  }
  if (overrideParts.length > 0) {
    identityLines.push(`- **Active Overrides:** ${overrideParts.join(', ')}`);
  }

  const paletteRows: Array<[string, string, string]> = [
    ['canvas', schema.palette.canvas, 'Primary page and application background'],
    ['surface', schema.palette.surface, 'Standard cards, panels, and section containers'],
    ['surfaceElevated', schema.palette.surfaceElevated, 'Elevated popovers, hover states, and overlays'],
    ['text', schema.palette.text, 'Primary headings and high-contrast body text'],
    ['textMuted', schema.palette.textMuted, 'Secondary labels, metadata, and helper copy'],
    ['border', schema.palette.border, 'Structural dividers, hairlines, and container outlines'],
    ['accent', schema.palette.accent, 'Primary highlights, interactive CTAs, and active indicators'],
    ['accentForeground', schema.palette.accentForeground, 'Text and icons rendered on accent backgrounds'],
  ];

  const semantic = schema.palette.semantic;
  if (semantic?.success) {
    paletteRows.push(['semantic.success', semantic.success, 'Positive health, confirmation, and success states']);
  }
  if (semantic?.warning) {
    paletteRows.push(['semantic.warning', semantic.warning, 'Caution notices, degraded states, and warnings']);
  }
  if (semantic?.danger) {
    paletteRows.push(['semantic.danger', semantic.danger, 'Errors, destructive actions, and critical alerts']);
  }
  if (semantic?.info) {
    paletteRows.push(['semantic.info', semantic.info, 'Informational badges, links, and telemetry notes']);
  }

  const lines = [
    `# DESIGN.md — ${meta.name}`,
    '',
    `This file is the persistent design system guide for **${meta.name}**. Consult it whenever building new pages, components, modals, forms, or states so all subsequent UI matches this template's visual language.`,
    '',
    '## Design Identity',
    '',
    ...identityLines,
    '',
    '## Color Palette & Tokens',
    '',
    '| Token | Value | Usage |',
    '| --- | --- | --- |',
    ...paletteRows.map(([token, value, usage]) => `| \`${token}\` | \`${value}\` | ${usage} |`),
    '',
    '## Typography',
    '',
    `- **Display:** ${schema.typography.display}`,
    `- **Body:** ${schema.typography.body}`,
    `- **Mono:** ${schema.typography.mono}`,
    `- **Heading Scale:** ${schema.typography.headingScale}`,
    `- **Body Scale:** ${schema.typography.bodyScale}`,
    '',
    '## Layout, Geometry & Spacing',
    '',
    `- **Radius:** ${schema.geometry.radius}`,
    `- **Border Style:** ${schema.geometry.borderStyle}`,
    `- **Spacing:** ${schema.geometry.spacing}`,
    `- **Container Max Width:** ${schema.geometry.containerMaxWidth}`,
    '',
    '## Surfaces, Elevation & Motion',
    '',
    `- **Elevation:** ${schema.elevation}`,
    `- **Motion:** ${schema.motion}`,
    '',
    '## Component & Layout Patterns',
    '',
    ...schema.components.map((component) => `- ${component}`),
    '',
    '## Design Rules',
    '',
    '### Do',
    '',
    ...schema.doRules.map((rule) => `- ${rule}`),
    '',
    "### Don't",
    '',
    ...schema.dontRules.map((rule) => `- ${rule}`),
    '',
    '## Extending This UI',
    '',
    '- Match the surface mode, palette tokens, border geometry, and typography roles above for every new route, modal, drawer, or form.',
    '- Keep all domain copy, metrics, and interactive callbacks typed via component props instead of hardcoding values inside layout primitives.',
    '- Reuse Tailwind v4 utility classes consistent with this guide rather than introducing ad-hoc CSS overrides.',
    '',
  ];

  return lines.join('\n');
}
