import {
  getEffectiveCopyOverrides,
  hasActiveCustomization,
} from './customize';
import type {
  DensityChoice,
  FontFamilyChoice,
  RadiusScale,
  TemplateCustomization,
  TemplateFile,
  TemplateMeta,
} from './types';

const RADIUS_GUIDANCE: Record<Exclude<RadiusScale, 'default'>, string> = {
  sharp: '0px corners across cards, panels, and buttons (preserve circular dots/avatars)',
  balanced: 'subtle 0.25rem–1rem radii across controls and surfaces',
  rounded: 'generous 0.375rem–2rem radii across controls and surfaces',
  pill: 'pill-shaped buttons/inputs with extra-rounded 1.5rem–2.75rem cards',
};

const FONT_GUIDANCE: Record<Exclude<FontFamilyChoice, 'default'>, string> = {
  sans: 'modern sans-serif typography across the layout',
  serif: 'editorial serif typography across the layout',
  mono: 'technical monospace typography across the layout',
};

const DENSITY_GUIDANCE: Record<Exclude<DensityChoice, 'default'>, string> = {
  compact: 'tighter spacing scale (--spacing: 0.21rem)',
  comfortable: 'balanced spacing scale (--spacing: 0.25rem)',
  spacious: 'roomier spacing scale (--spacing: 0.29rem)',
};

export function generateTemplateMarkdown(
  meta: TemplateMeta,
  files: TemplateFile[],
  customization?: TemplateCustomization,
): string {
  const dependencies = meta.dependencies.join(', ') || 'None';
  const isCustomized =
    Boolean(customization) && hasActiveCustomization(customization, meta);

  const rule2 = isCustomized
    ? '2. Preserve layout geometry while applying the Visual Token Overrides and Copy / Props Overrides listed in `## Active Customizations` below.'
    : '2. Do NOT alter colors, typography, border radius, or layout geometry.';

  const headerLines = [
    `# ${meta.name}`,
    '',
    `- **Style:** ${meta.styleFull}`,
    `- **Slug:** ${meta.slug}`,
    `- **Category:** ${meta.category}`,
    `- **Dependencies:** ${dependencies}`,
    `- **Target Directory:** ${meta.targetDir}`,
    `- **Description:** ${meta.description}`,
    '',
    '## Rules for Agent',
    '',
    '1. Write every file below verbatim into the requested target directory (or the default Target Directory above if none is specified), keeping relative paths and filenames intact.',
    rule2,
    '3. Only wire real data or copy via component props.',
  ];

  const customizationLines: string[] = [];

  if (isCustomized && customization) {
    const { tokens } = customization;
    const tokenBullets: string[] = [];

    if (
      tokens.accentColor !== 'default' &&
      /^#[0-9a-fA-F]{6}$/.test(tokens.accentColor)
    ) {
      const familyNote = meta.accentFamily
        ? ` (replaces primary \`${meta.accentFamily}\` accent palette)`
        : '';
      tokenBullets.push(
        `- **Accent Color:** \`${tokens.accentColor.toUpperCase()}\`${familyNote}`,
      );
    }
    if (tokens.radiusScale !== 'default') {
      tokenBullets.push(
        `- **Border Radius:** \`${tokens.radiusScale}\` — ${RADIUS_GUIDANCE[tokens.radiusScale]}`,
      );
    }
    if (tokens.fontFamily !== 'default') {
      tokenBullets.push(
        `- **Font Family:** \`${tokens.fontFamily}\` — ${FONT_GUIDANCE[tokens.fontFamily]}`,
      );
    }
    if (tokens.density !== 'default') {
      tokenBullets.push(
        `- **Spacing Density:** \`${tokens.density}\` — ${DENSITY_GUIDANCE[tokens.density]}`,
      );
    }

    const copyOverrides = getEffectiveCopyOverrides(customization, meta);

    customizationLines.push('', '## Active Customizations');

    if (tokenBullets.length > 0) {
      customizationLines.push('', '### Visual Token Overrides', '', ...tokenBullets);
    }

    if (copyOverrides.length > 0) {
      customizationLines.push(
        '',
        '### Copy / Props Overrides',
        '',
        ...copyOverrides.map(
          (item) =>
            `- **${item.label}** (\`${item.key}\`): ${JSON.stringify(item.value)}`,
        ),
        '',
        '```ts',
        'const customProps = {',
        ...copyOverrides.map(
          (item) => `  ${item.key}: ${JSON.stringify(item.value)},`,
        ),
        '};',
        '```',
      );
    }
  }

  const fileSections = files.flatMap((file) => {
    const fenceLang = file.filename.endsWith('.ts') ? 'ts' : 'tsx';
    return [
      '',
      `## File: \`${file.targetPath}\``,
      '',
      `\`\`\`${fenceLang}`,
      file.content.trimEnd(),
      '```',
    ];
  });

  return [...headerLines, ...customizationLines, ...fileSections, ''].join('\n');
}
