import type { TemplateFile, TemplateMeta } from './types';

export function generateTemplateMarkdown(
  meta: TemplateMeta,
  files: TemplateFile[],
): string {
  const dependencies = meta.dependencies.join(', ') || 'None';

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
    '1. Write every file below VERBATIM to its exact path.',
    '2. Do NOT alter colors, typography, border radius, or layout geometry.',
    '3. Only wire real data or copy via component props.',
  ];

  const fileSections = files.flatMap((file) => [
    '',
    `## File: \`${file.targetPath}\``,
    '',
    '```tsx',
    file.content.trimEnd(),
    '```',
  ]);

  return [...headerLines, ...fileSections, ''].join('\n');
}
