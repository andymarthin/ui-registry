import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateTemplateMarkdown } from '../src/templates/markdown.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../src/templates');

const EXPECTED_TEMPLATES = [
  'glass-portfolio',
  'saas-landing',
  'dev-portfolio',
  'homelab-ops',
  'saas-analytics',
  'admin-dashboard',
  'logistics-hub',
];

const VALID_CATEGORIES = new Set([
  'Portfolio',
  'Web',
  'Analytics',
  'Infrastructure',
  'Logistics',
]);

const VALID_ACCENT_FAMILIES = new Set([
  'sky',
  'orange',
  'amber',
  'emerald',
  'violet',
  'blue',
]);

const ALLOWED_EXTERNAL_IMPORTS = new Set(['react', 'lucide-react']);

/**
 * Tokenizes TypeScript/TSX source while skipping comments outside string and
 * template literals so URLs like `https://...` inside strings are never treated
 * as `//` line comments.
 */
function tokenizeSource(source) {
  const tokens = [];
  let i = 0;
  const len = source.length;

  function readTemplateLiteral() {
    i += 1; // skip opening `
    while (i < len) {
      const ch = source[i];
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === '`') {
        i += 1;
        return;
      }
      if (ch === '$' && source[i + 1] === '{') {
        i += 2;
        let depth = 1;
        while (i < len && depth > 0) {
          const inner = source[i];
          if (inner === '/' && source[i + 1] === '/') {
            i += 2;
            while (i < len && source[i] !== '\n') i += 1;
            continue;
          }
          if (inner === '/' && source[i + 1] === '*') {
            i += 2;
            while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
              i += 1;
            }
            i += 2;
            continue;
          }
          if (inner === "'" || inner === '"') {
            readQuotedString(inner);
            continue;
          }
          if (inner === '`') {
            readTemplateLiteral();
            continue;
          }
          if (inner === '{') depth += 1;
          else if (inner === '}') depth -= 1;
          i += 1;
        }
        continue;
      }
      i += 1;
    }
  }

  function readQuotedString(quote) {
    const start = i + 1;
    i += 1;
    let value = '';
    while (i < len) {
      const ch = source[i];
      if (ch === '\\') {
        if (i + 1 < len) {
          value += source[i + 1];
          i += 2;
        } else {
          i += 1;
        }
        continue;
      }
      if (ch === quote) {
        i += 1;
        return { terminated: true, value };
      }
      // JS/TS single/double-quoted strings cannot span raw newlines.
      // Breaking here prevents JSX apostrophes (e.g. "Don't") from swallowing code.
      if (ch === '\n' || ch === '\r') {
        return { terminated: false, value: source.slice(start, i) };
      }
      value += ch;
      i += 1;
    }
    return { terminated: false, value };
  }

  while (i < len) {
    const ch = source[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === '/' && source[i + 1] === '/') {
      i += 2;
      while (i < len && source[i] !== '\n') i += 1;
      continue;
    }

    if (ch === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const str = readQuotedString(ch);
      if (str.terminated) {
        tokens.push({ type: 'string', value: str.value });
      }
      continue;
    }

    if (ch === '`') {
      readTemplateLiteral();
      tokens.push({ type: 'template', value: '' });
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      const start = i;
      i += 1;
      while (i < len && /[A-Za-z0-9_$]/.test(source[i])) {
        i += 1;
      }
      tokens.push({ type: 'ident', value: source.slice(start, i) });
      continue;
    }

    tokens.push({ type: 'punct', value: ch });
    i += 1;
  }

  return tokens;
}

/**
 * Extracts all static `import`, `export ... from`, and dynamic `import('...')`
 * module specifiers from a TypeScript/TSX source string.
 */
function extractModuleSpecifiers(source) {
  const tokens = tokenizeSource(source);
  const specifiers = [];
  let braceDepth = 0;
  let parenDepth = 0;

  for (let idx = 0; idx < tokens.length; idx += 1) {
    const token = tokens[idx];
    const prev = idx > 0 ? tokens[idx - 1] : null;
    const isPropertyAccess = prev?.type === 'punct' && prev.value === '.';

    if (token.type === 'punct') {
      if (token.value === '{') braceDepth += 1;
      else if (token.value === '}') braceDepth = Math.max(0, braceDepth - 1);
      else if (token.value === '(') parenDepth += 1;
      else if (token.value === ')') parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }

    if (isPropertyAccess || token.type !== 'ident') {
      continue;
    }

    // Dynamic import('specifier') anywhere
    if (
      token.value === 'import' &&
      tokens[idx + 1]?.type === 'punct' &&
      tokens[idx + 1].value === '('
    ) {
      if (tokens[idx + 2]?.type === 'string') {
        specifiers.push(tokens[idx + 2].value);
      }
      continue;
    }

    // Top-level static import
    if (token.value === 'import' && braceDepth === 0 && parenDepth === 0) {
      const next = tokens[idx + 1];
      if (!next) continue;

      // Side-effect import: import './foo';
      if (next.type === 'string') {
        specifiers.push(next.value);
        continue;
      }

      // import ... from 'specifier'
      let localBraces = 0;
      let cursor = idx + 1;
      while (cursor < tokens.length) {
        const t = tokens[cursor];
        if (t.type === 'punct') {
          if (t.value === '{') localBraces += 1;
          else if (t.value === '}') localBraces = Math.max(0, localBraces - 1);
          else if (t.value === ';' && localBraces === 0) break;
        } else if (
          localBraces === 0 &&
          t.type === 'ident' &&
          t.value === 'from' &&
          tokens[cursor + 1]?.type === 'string'
        ) {
          specifiers.push(tokens[cursor + 1].value);
          idx = cursor + 1;
          break;
        }
        cursor += 1;
      }
      continue;
    }

    // Top-level re-export: export * from '...' or export { ... } from '...'
    if (token.value === 'export' && braceDepth === 0 && parenDepth === 0) {
      let cursor = idx + 1;
      if (tokens[cursor]?.type === 'ident' && tokens[cursor].value === 'type') {
        cursor += 1;
      }
      const startToken = tokens[cursor];
      if (!startToken) continue;

      if (
        startToken.type === 'punct' &&
        (startToken.value === '*' || startToken.value === '{')
      ) {
        let localBraces = 0;
        while (cursor < tokens.length) {
          const t = tokens[cursor];
          if (t.type === 'punct') {
            if (t.value === '{') localBraces += 1;
            else if (t.value === '}') localBraces = Math.max(0, localBraces - 1);
            else if (t.value === ';' && localBraces === 0) break;
          } else if (
            localBraces === 0 &&
            t.type === 'ident' &&
            t.value === 'from' &&
            tokens[cursor + 1]?.type === 'string'
          ) {
            specifiers.push(tokens[cursor + 1].value);
            idx = cursor + 1;
            break;
          }
          cursor += 1;
        }
      }
    }
  }

  return specifiers;
}

function assertNonEmptyString(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim().length > 0, `${label} must be non-empty`);
}

function getTemplateDirs() {
  return fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Recursively collects deliverable `.ts` / `.tsx` files as POSIX relative paths,
 * skipping top-level `meta.ts` and `Preview.tsx`.
 */
function collectDeliverableFiles(dirPath, prefix = '') {
  const results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(
        ...collectDeliverableFiles(path.join(dirPath, entry.name), relPath),
      );
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) continue;
    if (relPath === 'meta.ts' || relPath === 'Preview.tsx') continue;
    results.push(relPath);
  }
  return results.sort((a, b) => a.localeCompare(b));
}

/**
 * Resolves a relative import specifier from a deliverable file to another
 * deliverable file inside the same template directory, or returns null.
 */
function resolveTemplateRelativeImport(fromRelFile, specifier, deliverableSet) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return null;
  }

  const baseDir = path.posix.dirname(fromRelFile);
  const normalized = path.posix.normalize(
    baseDir === '.' ? specifier : path.posix.join(baseDir, specifier),
  );

  if (
    normalized === '..' ||
    normalized.startsWith('../') ||
    path.posix.isAbsolute(normalized)
  ) {
    return null;
  }

  if (
    normalized === 'Preview' ||
    normalized === 'Preview.tsx' ||
    normalized === 'meta' ||
    normalized === 'meta.ts'
  ) {
    return null;
  }

  const candidates = [
    normalized,
    `${normalized}.tsx`,
    `${normalized}.ts`,
    `${normalized}/index.tsx`,
    `${normalized}/index.ts`,
  ];
  for (const candidate of candidates) {
    if (deliverableSet.has(candidate)) return candidate;
  }
  return null;
}

describe('templates contract', () => {
  it('discovers at least 7 templates including all core templates', () => {
    const dirs = getTemplateDirs();
    assert.ok(
      dirs.length >= 7,
      `Expected at least 7 templates, found ${dirs.length}`,
    );
    for (const expected of EXPECTED_TEMPLATES) {
      assert.ok(
        dirs.includes(expected),
        `Expected template directory "${expected}" to exist`,
      );
    }
  });

  it('resolveTemplateRelativeImport accepts in-template imports and rejects escapes, Preview, meta, and missing files', () => {
    const set = new Set([
      'Dashboard.tsx',
      'types.ts',
      'layout/Sidebar.tsx',
      'widgets/index.ts',
      'widgets/KpiCard.tsx',
    ]);

    assert.equal(
      resolveTemplateRelativeImport('Dashboard.tsx', './types', set),
      'types.ts',
    );
    assert.equal(
      resolveTemplateRelativeImport('layout/Sidebar.tsx', '../types', set),
      'types.ts',
    );
    assert.equal(
      resolveTemplateRelativeImport('Dashboard.tsx', './layout/Sidebar', set),
      'layout/Sidebar.tsx',
    );
    assert.equal(
      resolveTemplateRelativeImport(
        'layout/Sidebar.tsx',
        '../widgets/KpiCard.tsx',
        set,
      ),
      'widgets/KpiCard.tsx',
    );
    assert.equal(
      resolveTemplateRelativeImport('Dashboard.tsx', './widgets', set),
      'widgets/index.ts',
    );

    assert.equal(
      resolveTemplateRelativeImport(
        'layout/Sidebar.tsx',
        '../../components/InspectBox',
        set,
      ),
      null,
    );
    assert.equal(
      resolveTemplateRelativeImport('layout/Sidebar.tsx', '../Preview', set),
      null,
    );
    assert.equal(
      resolveTemplateRelativeImport('Dashboard.tsx', './Preview.tsx', set),
      null,
    );
    assert.equal(
      resolveTemplateRelativeImport('layout/Sidebar.tsx', '../meta', set),
      null,
    );
    assert.equal(
      resolveTemplateRelativeImport('Dashboard.tsx', './meta.ts', set),
      null,
    );
    assert.equal(
      resolveTemplateRelativeImport('Dashboard.tsx', './Missing', set),
      null,
    );
  });

  it('extractModuleSpecifiers handles multi-line imports, re-exports, comments, and https:// strings', () => {
    const sample = `
      // import { Fake } from 'bad-comment-pkg';
      /*
        export * from '../Preview';
      */
      import {
        useState,
        type ReactNode,
      } from 'react';
      import { Sparkles } from "lucide-react";
      import { Helper } from './Helper';
      export { Helper } from './Helper';
      export * from './Other';
      const url = 'https://example.com/a//b';
      const label = "Don't break // here";
      export function Demo() {
        return <p title="https://example.com">Don't mind {url} {label}</p>;
      }
    `;

    assert.deepEqual(extractModuleSpecifiers(sample), [
      'react',
      'lucide-react',
      './Helper',
      './Helper',
      './Other',
    ]);
  });

  it('validates every template directory against metadata, standalone imports, inspect labels, and markdown SSOT', async () => {
    const dirs = getTemplateDirs();
    const seenSlugs = new Set();

    for (const dirName of dirs) {
      const dirPath = path.join(TEMPLATES_DIR, dirName);
      const metaPath = path.join(dirPath, 'meta.ts');
      const previewPath = path.join(dirPath, 'Preview.tsx');

      assert.ok(
        fs.existsSync(metaPath),
        `${dirName}: meta.ts must exist`,
      );
      assert.ok(
        fs.existsSync(previewPath),
        `${dirName}: Preview.tsx must exist`,
      );

      const deliverableFilenames = collectDeliverableFiles(dirPath);

      assert.ok(
        deliverableFilenames.length >= 1,
        `${dirName}: must have at least one deliverable .ts/.tsx file besides meta.ts and Preview.tsx`,
      );

      const metaModule = await import(pathToFileURL(metaPath).href);
      const meta = metaModule?.meta;
      assert.ok(meta && typeof meta === 'object', `${dirName}: meta.ts must export meta`);

      assert.equal(meta.slug, dirName, `${dirName}: meta.slug must match directory name`);
      assert.ok(!seenSlugs.has(meta.slug), `Duplicate template slug: ${meta.slug}`);
      seenSlugs.add(meta.slug);

      for (const field of [
        'name',
        'styleTag',
        'styleFull',
        'swatchBg',
        'swatchAccent',
        'swatchBorder',
        'description',
        'targetDir',
        'defaultInstruction',
      ]) {
        assertNonEmptyString(meta[field], `${dirName}.meta.${field}`);
      }

      assert.ok(
        VALID_CATEGORIES.has(meta.category),
        `${dirName}: invalid category "${meta.category}"`,
      );

      if (meta.accentFamily !== undefined) {
        assert.ok(
          VALID_ACCENT_FAMILIES.has(meta.accentFamily),
          `${dirName}: invalid accentFamily "${meta.accentFamily}"`,
        );
      }

      assert.ok(
        Array.isArray(meta.dependencies),
        `${dirName}: meta.dependencies must be an array`,
      );
      for (const dep of meta.dependencies) {
        assertNonEmptyString(dep, `${dirName}.meta.dependencies[]`);
      }
      assert.ok(
        meta.dependencies.includes('tailwindcss'),
        `${dirName}: meta.dependencies must include 'tailwindcss'`,
      );

      if (meta.customFields !== undefined) {
        assert.ok(
          Array.isArray(meta.customFields),
          `${dirName}: meta.customFields must be an array when present`,
        );
        const fieldKeys = new Set();
        for (const field of meta.customFields) {
          assertNonEmptyString(field?.key, `${dirName}.meta.customFields[].key`);
          assert.ok(
            !fieldKeys.has(field.key),
            `${dirName}: duplicate customFields key "${field.key}"`,
          );
          fieldKeys.add(field.key);
        }
      }

      const deliverableSet = new Set(deliverableFilenames);
      let hasInspectLabel = false;
      const templateFiles = [];
      const normalizedTargetDir = meta.targetDir.replace(/\/+$/, '');

      for (const filename of deliverableFilenames) {
        const filePath = path.join(dirPath, filename);
        const content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('data-inspect-label=')) {
          hasInspectLabel = true;
        }

        const specifiers = extractModuleSpecifiers(content);
        for (const specifier of specifiers) {
          if (ALLOWED_EXTERNAL_IMPORTS.has(specifier)) {
            continue;
          }

          assert.ok(
            specifier.startsWith('./') || specifier.startsWith('../'),
            `${dirName}/${filename}: disallowed import specifier "${specifier}" (must be 'react', 'lucide-react', or a relative import inside ${dirName})`,
          );
          assert.notEqual(
            resolveTemplateRelativeImport(filename, specifier, deliverableSet),
            null,
            `${dirName}/${filename}: relative import "${specifier}" must resolve to a deliverable .ts/.tsx file inside ${dirName} (not Preview.tsx, meta.ts, or outside the template folder)`,
          );
        }

        templateFiles.push({
          filename,
          targetPath: `${normalizedTargetDir}/${filename}`,
          content,
        });
      }

      assert.ok(
        hasInspectLabel,
        `${dirName}: at least one deliverable .tsx file must include data-inspect-label=`,
      );

      const markdown = generateTemplateMarkdown(meta, templateFiles);
      for (const file of templateFiles) {
        const fenceLang = file.filename.endsWith('.ts') ? 'ts' : 'tsx';
        const expectedSection = [
          `## File: \`${file.targetPath}\``,
          '',
          `\`\`\`${fenceLang}`,
          file.content.trimEnd(),
          '```',
        ].join('\n');

        assert.ok(
          markdown.includes(expectedSection),
          `${dirName}: markdown output missing verbatim section for ${file.targetPath}`,
        );
      }

      assert.doesNotMatch(
        markdown,
        /^## File: .*Preview\.tsx`?$/m,
        `${dirName}: Preview.tsx must never appear as a ## File: section in markdown`,
      );
      assert.doesNotMatch(
        markdown,
        /^## File: .*\/(?:Preview\.tsx|meta\.ts)`?$/m,
        `${dirName}: Preview.tsx and meta.ts must never appear as ## File: sections in markdown`,
      );
    }
  });
});
