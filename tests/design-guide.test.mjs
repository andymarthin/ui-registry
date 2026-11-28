import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_THEME_TOKENS, createDefaultCustomization } from '../src/templates/customize.ts';
import {
  generateDesignGuideMarkdown,
  resolveDesignGuidePath,
} from '../src/templates/design-guide.ts';
import {
  THEME_SCHEMES,
  applyThemeScheme,
  getThemeSchemeById,
  matchThemeScheme,
  resolveEffectiveDesignSchema,
  validateDesignSchema,
} from '../src/templates/design-schema.ts';

function makeValidDesign(overrides = {}) {
  return {
    id: 'ops-console-default',
    version: '1.0.0',
    mode: 'dark',
    summary: 'High-contrast dark telemetry surface with emerald status accents.',
    palette: {
      canvas: '#09090B',
      surface: '#111114',
      surfaceElevated: '#18181B',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
      border: '#27272A',
      accent: '#10B981',
      accentForeground: '#09090B',
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#38BDF8',
      },
    },
    typography: {
      display: 'Inter / system sans-serif',
      body: 'Inter / system sans-serif',
      mono: 'JetBrains Mono / ui-monospace',
      headingScale: 'text-2xl to text-4xl font-semibold tracking-tight',
      bodyScale: 'text-sm leading-relaxed',
    },
    geometry: {
      radius: 'rounded-lg (0.5rem)',
      borderStyle: '1px solid #27272A',
      spacing: '4px base grid (--spacing: 0.25rem)',
      containerMaxWidth: 'max-w-7xl',
    },
    elevation: 'Hairline borders with restrained surface contrast',
    motion: '150ms ease-out hover and focus transitions',
    components: [
      'Top telemetry bar with cluster selector',
      'KPI metric strip with tabular-nums values',
      'Filterable node status table',
    ],
    doRules: [
      'Use tabular-nums for all live latency and uptime figures.',
      'Maintain crisp 1px #27272A dividers between telemetry panels.',
    ],
    dontRules: [
      'Do not use heavy drop shadows on dark surfaces.',
      'Do not hardcode cluster metrics inside presentational components.',
    ],
    ...overrides,
  };
}

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
    dependencies: ['tailwindcss', 'lucide-react'],
    targetDir: 'src/components/ops',
    defaultInstruction: 'Wire cluster metrics via props.',
    accentFamily: 'emerald',
    customFields: [
      { key: 'clusterName', label: 'Cluster Name', defaultValue: 'prod-us-east' },
    ],
    design: makeValidDesign(),
    ...overrides,
  };
}

describe('THEME_SCHEMES & scheme helpers', () => {
  it('defines 7 unique presets with valid hex swatches and valid theme tokens', () => {
    assert.equal(THEME_SCHEMES.length, 7);

    const ids = new Set();
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    const validRadius = new Set(['default', 'sharp', 'balanced', 'rounded', 'pill']);
    const validFont = new Set(['default', 'sans', 'serif', 'mono']);
    const validDensity = new Set(['default', 'compact', 'comfortable', 'spacious']);

    for (const scheme of THEME_SCHEMES) {
      assert.ok(scheme.id && !ids.has(scheme.id), `duplicate or empty id: ${scheme.id}`);
      ids.add(scheme.id);

      assert.ok(scheme.name.trim().length > 0);
      assert.ok(scheme.description.trim().length > 0);
      assert.match(scheme.swatchBg, hexRe);
      assert.match(scheme.swatchAccent, hexRe);
      assert.match(scheme.swatchBorder, hexRe);

      assert.ok(
        scheme.tokens.accentColor === 'default' || hexRe.test(scheme.tokens.accentColor),
        `invalid tokens.accentColor for ${scheme.id}: ${scheme.tokens.accentColor}`,
      );
      assert.ok(validRadius.has(scheme.tokens.radiusScale));
      assert.ok(validFont.has(scheme.tokens.fontFamily));
      assert.ok(validDensity.has(scheme.tokens.density));
    }

    assert.equal(THEME_SCHEMES[0].id, 'default');
  });

  it('getThemeSchemeById resolves case-insensitively and handles missing or unknown ids', () => {
    assert.equal(getThemeSchemeById('midnight-glass')?.name, 'Midnight Glass');
    assert.equal(getThemeSchemeById('  MIDNIGHT-GLASS  ')?.id, 'midnight-glass');
    assert.equal(getThemeSchemeById('default')?.id, 'default');
    assert.equal(getThemeSchemeById(''), undefined);
    assert.equal(getThemeSchemeById(null), undefined);
    assert.equal(getThemeSchemeById(undefined), undefined);
    assert.equal(getThemeSchemeById('nonexistent'), undefined);
  });

  it('applyThemeScheme applies preset tokens while preserving copy and resets on default or unknown id', () => {
    const base = createDefaultCustomization(makeMeta());
    base.copy.clusterName = 'eu-west-2';

    const applied = applyThemeScheme(base, 'phosphor-noc');
    assert.deepEqual(applied.tokens, {
      accentColor: '#22C55E',
      radiusScale: 'sharp',
      fontFamily: 'mono',
      density: 'compact',
    });
    assert.deepEqual(applied.copy, { clusterName: 'eu-west-2' });
    assert.notEqual(applied.copy, base.copy);

    const resetDefault = applyThemeScheme(applied, 'default');
    assert.deepEqual(resetDefault.tokens, DEFAULT_THEME_TOKENS);
    assert.deepEqual(resetDefault.copy, { clusterName: 'eu-west-2' });

    const resetUnknown = applyThemeScheme(applied, 'does-not-exist');
    assert.deepEqual(resetUnknown.tokens, DEFAULT_THEME_TOKENS);
    assert.deepEqual(resetUnknown.copy, { clusterName: 'eu-west-2' });
  });

  it('matchThemeScheme matches non-default presets case-insensitively on hex and returns undefined for default or partial custom tokens', () => {
    assert.equal(matchThemeScheme(DEFAULT_THEME_TOKENS), undefined);

    const matched = matchThemeScheme({
      accentColor: '#38bdf8',
      radiusScale: 'rounded',
      fontFamily: 'sans',
      density: 'comfortable',
    });
    assert.equal(matched?.id, 'midnight-glass');

    const partialMismatch = matchThemeScheme({
      accentColor: '#38BDF8',
      radiusScale: 'pill',
      fontFamily: 'sans',
      density: 'comfortable',
    });
    assert.equal(partialMismatch, undefined);
  });
});

describe('validateDesignSchema', () => {
  it('returns an empty array for a valid TemplateDesignSchema', () => {
    assert.deepEqual(validateDesignSchema(makeValidDesign(), 'ops.meta.design'), []);
  });

  it('catches non-object inputs, missing fields, invalid mode, invalid semantic tokens, and empty arrays', () => {
    assert.deepEqual(validateDesignSchema(null, 'broken'), ['broken must be a non-null object']);
    assert.deepEqual(validateDesignSchema([], 'broken'), ['broken must be a non-null object']);

    const errors = validateDesignSchema(
      {
        id: '',
        version: '  ',
        mode: 'sepia',
        summary: 'ok',
        elevation: '',
        motion: null,
        palette: {
          canvas: '#09090B',
          surface: '',
          surfaceElevated: '#18181B',
          text: '#FAFAFA',
          textMuted: '#A1A1AA',
          border: '#27272A',
          accent: '#10B981',
          accentForeground: '',
          semantic: {
            success: '',
          },
        },
        typography: {
          display: 'Inter',
          body: 'Inter',
          mono: '',
          headingScale: 'text-2xl',
          bodyScale: 'text-sm',
        },
        geometry: null,
        components: [],
        doRules: ['Valid rule', ''],
        dontRules: 'not-an-array',
      },
      'custom.design',
    );

    assert.ok(errors.includes('custom.design.id must be a non-empty string'));
    assert.ok(errors.includes('custom.design.version must be a non-empty string'));
    assert.ok(errors.includes('custom.design.elevation must be a non-empty string'));
    assert.ok(errors.includes('custom.design.motion must be a non-empty string'));
    assert.ok(errors.includes("custom.design.mode must be 'dark' or 'light'"));
    assert.ok(errors.includes('custom.design.palette.surface must be a non-empty string'));
    assert.ok(errors.includes('custom.design.palette.accentForeground must be a non-empty string'));
    assert.ok(errors.includes('custom.design.palette.semantic.success must be a non-empty string'));
    assert.ok(errors.includes('custom.design.typography.mono must be a non-empty string'));
    assert.ok(errors.includes('custom.design.geometry must be a non-null object'));
    assert.ok(errors.includes('custom.design.components must be a non-empty array of non-empty strings'));
    assert.ok(errors.includes('custom.design.doRules must be a non-empty array of non-empty strings'));
    assert.ok(errors.includes('custom.design.dontRules must be a non-empty array of non-empty strings'));
  });
});

describe('resolveEffectiveDesignSchema', () => {
  it('returns a cloned base schema when customization is omitted', () => {
    const meta = makeMeta();
    const resolved = resolveEffectiveDesignSchema(meta);

    assert.deepEqual(resolved, meta.design);
    assert.notEqual(resolved, meta.design);
    assert.notEqual(resolved.palette, meta.design.palette);
    assert.notEqual(resolved.doRules, meta.design.doRules);
  });

  it('applies accent, radius, font, and density overrides without mutating meta.design', () => {
    const meta = makeMeta();
    const resolved = resolveEffectiveDesignSchema(meta, {
      tokens: {
        accentColor: '#f59e0b',
        radiusScale: 'sharp',
        fontFamily: 'mono',
        density: 'compact',
      },
      copy: {},
    });

    assert.equal(resolved.palette.accent, '#F59E0B');
    assert.equal(resolved.palette.accentForeground, '#09090B');
    assert.ok(resolved.geometry.radius.includes('0px sharp corners'));
    assert.ok(resolved.typography.display.includes('font-mono'));
    assert.ok(resolved.typography.body.includes('font-mono'));
    assert.ok(resolved.geometry.spacing.includes('0.21rem'));

    // Original meta.design stays untouched
    assert.equal(meta.design.palette.accent, '#10B981');
    assert.equal(meta.design.geometry.radius, 'rounded-lg (0.5rem)');
  });

  it('synthesizes a valid fallback schema when meta.design is omitted', () => {
    const darkMeta = makeMeta({ design: undefined, swatchBg: '#09090B', swatchAccent: '#38BDF8' });
    const darkResolved = resolveEffectiveDesignSchema(darkMeta);
    assert.equal(darkResolved.mode, 'dark');
    assert.equal(darkResolved.palette.canvas, '#09090B');
    assert.equal(darkResolved.palette.accent, '#38BDF8');
    assert.deepEqual(validateDesignSchema(darkResolved, 'fallback.dark'), []);

    const lightMeta = makeMeta({ design: undefined, swatchBg: '#FAFAFA', swatchAccent: '#FF4500' });
    const lightResolved = resolveEffectiveDesignSchema(lightMeta);
    assert.equal(lightResolved.mode, 'light');
    assert.equal(lightResolved.palette.canvas, '#FAFAFA');
    assert.equal(lightResolved.palette.accent, '#FF4500');
    assert.deepEqual(validateDesignSchema(lightResolved, 'fallback.light'), []);
  });
});

describe('resolveDesignGuidePath', () => {
  it('resolves root, targetDir, none, and empty targetDir paths', () => {
    assert.equal(resolveDesignGuidePath('src/components/ops'), 'DESIGN.md');
    assert.equal(resolveDesignGuidePath('src/components/ops', 'root'), 'DESIGN.md');
    assert.equal(
      resolveDesignGuidePath('src/components/ops', 'targetDir'),
      'src/components/ops/DESIGN.md',
    );
    assert.equal(
      resolveDesignGuidePath('  src/components/ops/  ', 'targetDir'),
      'src/components/ops/DESIGN.md',
    );
    assert.equal(resolveDesignGuidePath('', 'targetDir'), 'DESIGN.md');
    assert.equal(resolveDesignGuidePath('   ', 'targetDir'), 'DESIGN.md');
    assert.equal(resolveDesignGuidePath('src/components/ops', 'none'), null);
  });
});

describe('generateDesignGuideMarkdown', () => {
  it('renders all standard sections and palette rows for a template', () => {
    const md = generateDesignGuideMarkdown(makeMeta());

    const expectedSections = [
      '# DESIGN.md — Ops Console',
      '## Design Identity',
      '## Color Palette & Tokens',
      '## Typography',
      '## Layout, Geometry & Spacing',
      '## Surfaces, Elevation & Motion',
      '## Component & Layout Patterns',
      '## Design Rules',
      "### Do",
      "### Don't",
      '## Extending This UI',
    ];

    for (const section of expectedSections) {
      assert.ok(md.includes(section), `Missing section: ${section}`);
    }

    assert.ok(md.includes('| `canvas` | `#09090B` |'));
    assert.ok(md.includes('| `accent` | `#10B981` |'));
    assert.ok(md.includes('| `semantic.success` | `#10B981` |'));
    assert.equal(md.includes('Applied Theme Scheme'), false);
    assert.equal(md.includes('Active Overrides'), false);
  });

  it('reflects active overrides and matched Theme Scheme name when customized', () => {
    const md = generateDesignGuideMarkdown(makeMeta(), {
      tokens: {
        accentColor: '#38bdf8',
        radiusScale: 'rounded',
        fontFamily: 'sans',
        density: 'comfortable',
      },
      copy: {
        clusterName: 'prod-eu-west',
      },
    });

    assert.ok(md.includes('- **Applied Theme Scheme:** Midnight Glass (`midnight-glass`)'));
    assert.ok(
      md.includes(
        '- **Active Overrides:** accent `#38BDF8`, radius `rounded`, font `sans`, density `comfortable`, copy overrides (`clusterName`)',
      ),
    );
    assert.ok(md.includes('| `accent` | `#38BDF8` |'));
    assert.ok(md.includes('generous rounded radii'));
    assert.ok(md.includes('Modern geometric sans-serif (font-sans)'));
    assert.ok(md.includes('(--spacing: 0.25rem, balanced padding)'));
  });
});
