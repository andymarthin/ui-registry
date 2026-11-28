import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultCustomization } from '../src/templates/customize.ts';
import { generateDesignGuideMarkdown } from '../src/templates/design-guide.ts';
import { generateTemplateMarkdown } from '../src/templates/markdown.ts';

function makeMeta(overrides = {}) {
  return {
    slug: 'ops-console',
    name: 'Ops Console',
    category: 'Infrastructure',
    styleTag: 'Terminal',
    styleFull: 'Dark Emerald Ops Terminal',
    swatchBg: '#09090B',
    swatchAccent: '#10B981',
    swatchBorder: '#27272A',
    description: 'High-density operational telemetry dashboard.',
    dependencies: ['lucide-react'],
    targetDir: 'src/components/ops',
    defaultInstruction: 'Install Ops Console',
    accentFamily: 'emerald',
    customFields: [
      { key: 'clusterName', label: 'Cluster Name', defaultValue: 'prod-us-east' },
      { key: 'operatorTag', label: 'Operator Tag', defaultValue: 'oncall-primary' },
    ],
    ...overrides,
  };
}

const SAMPLE_FILES = [
  {
    filename: 'OpsConsole.tsx',
    targetPath: 'src/components/ops/OpsConsole.tsx',
    content: 'export function OpsConsole() {\n  return <div>Ops</div>;\n}\n   \n',
  },
  {
    filename: 'types.tsx',
    targetPath: 'src/components/ops/types.tsx',
    content: 'export interface NodeStatus {\n  id: string;\n}\t  ',
  },
];

describe('generateTemplateMarkdown (uncustomized)', () => {
  it('renders heading, metadata bullets, default rules, no active customizations, and trimmed tsx blocks', () => {
    const meta = makeMeta({ dependencies: ['lucide-react', 'clsx'] });
    const md = generateTemplateMarkdown(meta, SAMPLE_FILES);

    const expected = [
      '# Ops Console',
      '',
      '- **Style:** Dark Emerald Ops Terminal',
      '- **Slug:** ops-console',
      '- **Category:** Infrastructure',
      '- **Dependencies:** lucide-react, clsx',
      '- **Target Directory:** src/components/ops',
      '- **Description:** High-density operational telemetry dashboard.',
      '',
      '## Rules for Agent',
      '',
      '1. Write every file below verbatim into the requested target directory (or the default Target Directory above if none is specified), keeping relative paths and filenames intact.',
      '2. Do NOT alter colors, typography, border radius, or layout geometry.',
      '3. Only wire real data or copy via component props.',
      '4. Write `DESIGN.md` verbatim and treat it as this project\'s persistent design system guide—consult it whenever building new pages, components, modals, or forms so all subsequent UI matches this template\'s visual language.',
      '',
      '## File: `src/components/ops/OpsConsole.tsx`',
      '',
      '```tsx',
      'export function OpsConsole() {',
      '  return <div>Ops</div>;',
      '}',
      '```',
      '',
      '## File: `src/components/ops/types.tsx`',
      '',
      '```tsx',
      'export interface NodeStatus {',
      '  id: string;',
      '}',
      '```',
      '',
      '## File: `DESIGN.md`',
      '',
      '````markdown',
      generateDesignGuideMarkdown(meta).trimEnd(),
      '````',
      '',
    ].join('\n');

    assert.equal(md, expected);
    assert.equal(md.includes('## Active Customizations'), false);
  });

  it('emits ts fences for .ts files and tsx fences for nested .tsx paths', () => {
    const files = [
      {
        filename: 'layout/Sidebar.tsx',
        targetPath: 'src/components/ops/layout/Sidebar.tsx',
        content: 'export function Sidebar() {\n  return <aside />;\n}\n',
      },
      {
        filename: 'lib/format.ts',
        targetPath: 'src/components/ops/lib/format.ts',
        content: 'export const fmt = (n: number) => String(n);\n',
      },
    ];
    const md = generateTemplateMarkdown(makeMeta(), files);

    assert.ok(
      md.includes(
        [
          '## File: `src/components/ops/layout/Sidebar.tsx`',
          '',
          '```tsx',
          'export function Sidebar() {',
          '  return <aside />;',
          '}',
          '```',
        ].join('\n'),
      ),
    );
    assert.ok(
      md.includes(
        [
          '## File: `src/components/ops/lib/format.ts`',
          '',
          '```ts',
          'export const fmt = (n: number) => String(n);',
          '```',
        ].join('\n'),
      ),
    );
  });

  it('uses "None" fallback when dependencies array is empty', () => {
    const meta = makeMeta({ dependencies: [] });
    const md = generateTemplateMarkdown(meta, SAMPLE_FILES);
    assert.ok(md.includes('- **Dependencies:** None\n'));
  });
});

describe('generateTemplateMarkdown (customized)', () => {
  it('renders tokens-only customization with uppercased hex, accentFamily note, and token guidance', () => {
    const meta = makeMeta({ accentFamily: 'emerald' });
    const md = generateTemplateMarkdown(meta, SAMPLE_FILES, {
      tokens: {
        accentColor: '#38bdf8',
        radiusScale: 'sharp',
        fontFamily: 'mono',
        density: 'compact',
      },
      copy: {
        clusterName: 'prod-us-east',
      },
    });

    assert.ok(
      md.includes(
        '2. Preserve layout geometry while applying the Visual Token Overrides and Copy / Props Overrides listed in `## Active Customizations` below.',
      ),
    );
    assert.ok(md.includes('## Active Customizations\n\n### Visual Token Overrides\n'));
    assert.ok(
      md.includes(
        '- **Accent Color:** `#38BDF8` (replaces primary `emerald` accent palette)',
      ),
    );
    assert.ok(
      md.includes(
        '- **Border Radius:** `sharp` — 0px corners across cards, panels, and buttons (preserve circular dots/avatars)',
      ),
    );
    assert.ok(
      md.includes(
        '- **Font Family:** `mono` — technical monospace typography across the layout',
      ),
    );
    assert.ok(
      md.includes(
        '- **Spacing Density:** `compact` — tighter spacing scale (--spacing: 0.21rem)',
      ),
    );
    assert.equal(md.includes('### Copy / Props Overrides'), false);
    assert.ok(
      md.indexOf('## Active Customizations') < md.indexOf('## File: `src/components/ops/OpsConsole.tsx`'),
    );
  });

  it('omits accentFamily note when meta.accentFamily is undefined', () => {
    const meta = makeMeta({ accentFamily: undefined });
    const md = generateTemplateMarkdown(meta, SAMPLE_FILES, {
      tokens: {
        accentColor: '#ff4500',
        radiusScale: 'default',
        fontFamily: 'default',
        density: 'default',
      },
      copy: {},
    });

    assert.ok(md.includes('- **Accent Color:** `#FF4500`\n'));
    assert.equal(md.includes('replaces primary'), false);
  });

  it('renders copy-only customization with bullet list and TS customProps snippet', () => {
    const meta = makeMeta();
    const md = generateTemplateMarkdown(meta, SAMPLE_FILES, {
      tokens: {
        accentColor: 'default',
        radiusScale: 'default',
        fontFamily: 'default',
        density: 'default',
      },
      copy: {
        clusterName: '  eu-central-1  ',
        operatorTag: 'sre-"alpha"',
      },
    });

    assert.ok(
      md.includes(
        '2. Preserve layout geometry while applying the Visual Token Overrides and Copy / Props Overrides listed in `## Active Customizations` below.',
      ),
    );
    assert.equal(md.includes('### Visual Token Overrides'), false);

    const expectedCopyBlock = [
      '## Active Customizations',
      '',
      '### Copy / Props Overrides',
      '',
      '- **Cluster Name** (`clusterName`): "eu-central-1"',
      '- **Operator Tag** (`operatorTag`): "sre-\\"alpha\\""',
      '',
      '```ts',
      'const customProps = {',
      '  clusterName: "eu-central-1",',
      '  operatorTag: "sre-\\"alpha\\"",',
      '};',
      '```',
    ].join('\n');

    assert.ok(md.includes(expectedCopyBlock));
  });

  it('renders both Visual Token Overrides and Copy / Props Overrides when both are active', () => {
    const meta = makeMeta();
    const md = generateTemplateMarkdown(meta, SAMPLE_FILES, {
      tokens: {
        accentColor: '#8b5cf6',
        radiusScale: 'pill',
        fontFamily: 'serif',
        density: 'spacious',
      },
      copy: {
        clusterName: 'staging-west',
      },
    });

    assert.ok(md.includes('### Visual Token Overrides'));
    assert.ok(md.includes('### Copy / Props Overrides'));
    assert.ok(
      md.includes(
        '- **Border Radius:** `pill` — pill-shaped buttons/inputs with extra-rounded 1.5rem–2.75rem cards',
      ),
    );
    assert.ok(
      md.includes(
        '- **Font Family:** `serif` — editorial serif typography across the layout',
      ),
    );
    assert.ok(
      md.includes(
        '- **Spacing Density:** `spacious` — roomier spacing scale (--spacing: 0.29rem)',
      ),
    );
    assert.ok(md.includes('- **Cluster Name** (`clusterName`): "staging-west"'));
    assert.ok(md.includes('  clusterName: "staging-west",'));
  });
});

describe('generateTemplateMarkdown (default or invalid customization)', () => {
  it('produces identical output to uncustomized when given default or invalid customization', () => {
    const meta = makeMeta();
    const baseline = generateTemplateMarkdown(meta, SAMPLE_FILES);

    const withDefaults = generateTemplateMarkdown(
      meta,
      SAMPLE_FILES,
      createDefaultCustomization(meta),
    );
    assert.equal(withDefaults, baseline);

    const withInvalid = generateTemplateMarkdown(meta, SAMPLE_FILES, {
      tokens: {
        accentColor: '#fff',
        radiusScale: 'invalid',
        fontFamily: 'comic',
        density: 'ultra',
      },
      copy: {
        clusterName: '   ',
        unknownKey: 'Ignored',
      },
    });
    assert.equal(withInvalid, baseline);
    assert.equal(withInvalid.includes('## Active Customizations'), false);
  });
});

describe('generateTemplateMarkdown (DESIGN.md placement & propagation)', () => {
  it('supports designGuideTarget="root", "targetDir", and "none"', () => {
    const meta = makeMeta();

    const rootMd = generateTemplateMarkdown(meta, SAMPLE_FILES, undefined, {
      designGuideTarget: 'root',
    });
    assert.ok(rootMd.includes('4. Write `DESIGN.md` verbatim'));
    assert.ok(rootMd.includes('## File: `DESIGN.md`\n\n````markdown\n# DESIGN.md — Ops Console'));

    const targetDirMd = generateTemplateMarkdown(meta, SAMPLE_FILES, undefined, {
      designGuideTarget: 'targetDir',
    });
    assert.ok(targetDirMd.includes('4. Write `src/components/ops/DESIGN.md` verbatim'));
    assert.ok(
      targetDirMd.includes(
        '## File: `src/components/ops/DESIGN.md`\n\n````markdown\n# DESIGN.md — Ops Console',
      ),
    );
    assert.equal(targetDirMd.includes('## File: `DESIGN.md`'), false);

    const noneMd = generateTemplateMarkdown(meta, SAMPLE_FILES, undefined, {
      designGuideTarget: 'none',
    });
    assert.equal(noneMd.includes('4. Write '), false);
    assert.equal(noneMd.includes('DESIGN.md'), false);
  });

  it('propagates customized theme tokens and copy overrides into the embedded DESIGN.md block', () => {
    const meta = makeMeta();
    const customization = {
      tokens: {
        accentColor: '#38bdf8',
        radiusScale: 'rounded',
        fontFamily: 'sans',
        density: 'comfortable',
      },
      copy: {
        clusterName: 'prod-eu-central',
      },
    };

    const md = generateTemplateMarkdown(meta, SAMPLE_FILES, customization);
    const marker = '## File: `DESIGN.md`\n\n````markdown\n';
    const idx = md.indexOf(marker);
    assert.ok(idx !== -1, 'Expected embedded DESIGN.md section');
    const embeddedGuide = md.slice(idx + marker.length);

    assert.ok(embeddedGuide.includes('- **Applied Theme Scheme:** Midnight Glass (`midnight-glass`)'));
    assert.ok(
      embeddedGuide.includes(
        '- **Active Overrides:** accent `#38BDF8`, radius `rounded`, font `sans`, density `comfortable`, copy overrides (`clusterName`)',
      ),
    );
    assert.ok(embeddedGuide.includes('| `accent` | `#38BDF8` |'));
    assert.ok(embeddedGuide.includes('generous rounded radii'));
    assert.ok(embeddedGuide.includes('Modern geometric sans-serif (font-sans)'));
  });
});
