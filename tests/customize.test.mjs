import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_THEME_TOKENS,
  buildCustomizationPromptClause,
  buildStageStyleAndAttrs,
  countActiveCustomizations,
  createDefaultCustomization,
  getEffectiveCopyOverrides,
  hasActiveCustomization,
  parseCustomizationParams,
  serializeCustomizationParams,
} from '../src/templates/customize.ts';

function makeMeta(overrides = {}) {
  return {
    slug: 'sample-template',
    name: 'Sample Template',
    category: 'Web',
    styleTag: 'Minimal',
    styleFull: 'Minimal Studio Grid',
    swatchBg: '#09090B',
    swatchAccent: '#38BDF8',
    swatchBorder: '#27272A',
    description: 'A sample template for unit tests.',
    dependencies: ['lucide-react'],
    targetDir: 'src/components/sample',
    defaultInstruction: 'Install sample template',
    accentFamily: 'sky',
    customFields: [
      { key: 'brandName', label: 'Brand Name', defaultValue: 'Acme Studio' },
      { key: 'headline', label: 'Headline', defaultValue: 'Build faster' },
      { key: 'ctaLabel', label: 'CTA Label', defaultValue: 'Get Started' },
    ],
    ...overrides,
  };
}

describe('createDefaultCustomization', () => {
  it('returns default tokens and populates copy from meta.customFields', () => {
    const meta = makeMeta();
    const custom = createDefaultCustomization(meta);

    assert.deepEqual(custom.tokens, {
      accentColor: 'default',
      radiusScale: 'default',
      fontFamily: 'default',
      density: 'default',
    });
    assert.deepEqual(custom.copy, {
      brandName: 'Acme Studio',
      headline: 'Build faster',
      ctaLabel: 'Get Started',
    });
  });

  it('handles missing meta or missing customFields', () => {
    assert.deepEqual(createDefaultCustomization(), {
      tokens: { ...DEFAULT_THEME_TOKENS },
      copy: {},
    });
    assert.deepEqual(createDefaultCustomization(makeMeta({ customFields: undefined })), {
      tokens: { ...DEFAULT_THEME_TOKENS },
      copy: {},
    });
  });

  it('returns fresh object instances on each call', () => {
    const meta = makeMeta();
    const first = createDefaultCustomization(meta);
    const second = createDefaultCustomization(meta);

    assert.notEqual(first, second);
    assert.notEqual(first.tokens, second.tokens);
    assert.notEqual(first.tokens, DEFAULT_THEME_TOKENS);
    assert.notEqual(first.copy, second.copy);

    first.tokens.accentColor = '#FF4500';
    first.copy.brandName = 'Mutated';

    assert.equal(second.tokens.accentColor, 'default');
    assert.equal(second.copy.brandName, 'Acme Studio');
    assert.equal(DEFAULT_THEME_TOKENS.accentColor, 'default');
  });
});

describe('getEffectiveCopyOverrides', () => {
  it('returns [] when customization is undefined, no customFields exist, or nothing changed', () => {
    const meta = makeMeta();
    assert.deepEqual(getEffectiveCopyOverrides(undefined, meta), []);
    assert.deepEqual(
      getEffectiveCopyOverrides(createDefaultCustomization(meta), meta),
      [],
    );
    assert.deepEqual(
      getEffectiveCopyOverrides(
        { tokens: { ...DEFAULT_THEME_TOKENS }, copy: { brandName: 'Changed' } },
        makeMeta({ customFields: [] }),
      ),
      [],
    );
    assert.deepEqual(
      getEffectiveCopyOverrides(
        { tokens: { ...DEFAULT_THEME_TOKENS }, copy: { brandName: 'Changed' } },
        makeMeta({ customFields: undefined }),
      ),
      [],
    );
  });

  it('ignores unchanged defaults with whitespace, empty/whitespace strings, and unknown keys', () => {
    const meta = makeMeta({
      customFields: [
        { key: 'brandName', label: 'Brand Name', defaultValue: '  Acme Studio  ' },
        { key: 'headline', label: 'Headline', defaultValue: 'Build faster' },
        { key: 'ctaLabel', label: 'CTA Label', defaultValue: 'Get Started' },
      ],
    });

    const overrides = getEffectiveCopyOverrides(
      {
        tokens: { ...DEFAULT_THEME_TOKENS },
        copy: {
          brandName: 'Acme Studio',
          headline: '   \t\n ',
          ctaLabel: '  Get Started  ',
          unknownKey: 'Should be ignored',
        },
      },
      meta,
    );

    assert.deepEqual(overrides, []);
  });

  it('returns trimmed { key, label, value } for changed fields', () => {
    const meta = makeMeta();
    const overrides = getEffectiveCopyOverrides(
      {
        tokens: { ...DEFAULT_THEME_TOKENS },
        copy: {
          brandName: '  Nova Labs  ',
          headline: 'Build faster',
          ctaLabel: ' Launch Now ',
          extra: 'Ignored',
        },
      },
      meta,
    );

    assert.deepEqual(overrides, [
      { key: 'brandName', label: 'Brand Name', value: 'Nova Labs' },
      { key: 'ctaLabel', label: 'CTA Label', value: 'Launch Now' },
    ]);
  });
});

describe('countActiveCustomizations & hasActiveCustomization', () => {
  it('returns 0 and false when undefined or at defaults', () => {
    const meta = makeMeta();
    assert.equal(countActiveCustomizations(undefined, meta), 0);
    assert.equal(hasActiveCustomization(undefined, meta), false);

    const defaults = createDefaultCustomization(meta);
    assert.equal(countActiveCustomizations(defaults, meta), 0);
    assert.equal(hasActiveCustomization(defaults, meta), false);
  });

  it('counts valid 6-digit hex, non-default radius/font/density, and active copy overrides', () => {
    const meta = makeMeta();
    const custom = {
      tokens: {
        accentColor: '#38bdf8',
        radiusScale: 'rounded',
        fontFamily: 'mono',
        density: 'compact',
      },
      copy: {
        brandName: 'Orbit UI',
        headline: 'Ship clean UI',
        ctaLabel: 'Get Started',
      },
    };

    assert.equal(countActiveCustomizations(custom, meta), 6);
    assert.equal(hasActiveCustomization(custom, meta), true);
  });

  it('ignores invalid hex colors and invalid enum values', () => {
    const meta = makeMeta();

    for (const invalidHex of ['#fff', 'blue', '#12345g', '38BDF8', '#1234567', '']) {
      const custom = {
        tokens: {
          accentColor: invalidHex,
          radiusScale: 'huge',
          fontFamily: 'comic',
          density: 'ultra',
        },
        copy: {
          brandName: '   ',
          unknown: 'Value',
        },
      };

      assert.equal(countActiveCustomizations(custom, meta), 0, `hex=${invalidHex}`);
      assert.equal(hasActiveCustomization(custom, meta), false, `hex=${invalidHex}`);
    }
  });
});

describe('buildCustomizationPromptClause', () => {
  it('returns empty string when customization is undefined or default', () => {
    const meta = makeMeta();
    assert.equal(buildCustomizationPromptClause(undefined, meta), '');
    assert.equal(buildCustomizationPromptClause(createDefaultCustomization(meta), meta), '');
  });

  it('formats uppercased accent, tokens, and JSON-escaped props joined by "; "', () => {
    const meta = makeMeta();
    const clause = buildCustomizationPromptClause(
      {
        tokens: {
          accentColor: '#38bdf8',
          radiusScale: 'pill',
          fontFamily: 'serif',
          density: 'spacious',
        },
        copy: {
          brandName: '  Acme "Pro" \\ Studio  ',
          headline: 'Line 1\nLine 2',
          ctaLabel: 'Get Started',
        },
      },
      meta,
    );

    assert.equal(
      clause,
      'accent=#38BDF8, radius=pill, font=serif, density=spacious; props={ brandName: "Acme \\"Pro\\" \\\\ Studio", headline: "Line 1\\nLine 2" }',
    );
  });

  it('formats tokens-only and props-only clauses without stray separators', () => {
    const meta = makeMeta();

    const tokensOnly = buildCustomizationPromptClause(
      {
        tokens: {
          accentColor: '#ff4500',
          radiusScale: 'default',
          fontFamily: 'sans',
          density: 'default',
        },
        copy: {},
      },
      meta,
    );
    assert.equal(tokensOnly, 'accent=#FF4500, font=sans');

    const propsOnly = buildCustomizationPromptClause(
      {
        tokens: { ...DEFAULT_THEME_TOKENS },
        copy: { brandName: 'Relay' },
      },
      meta,
    );
    assert.equal(propsOnly, 'props={ brandName: "Relay" }');
  });
});

describe('serializeCustomizationParams & parseCustomizationParams', () => {
  it('round-trips tokens and copy overrides and uppercases hex colors', () => {
    const meta = makeMeta();
    const input = {
      tokens: {
        accentColor: '#8b5cf6',
        radiusScale: 'balanced',
        fontFamily: 'mono',
        density: 'comfortable',
      },
      copy: {
        brandName: '  Vektor  ',
        headline: 'Build faster',
        ctaLabel: 'Deploy Now',
      },
    };

    const params = serializeCustomizationParams(input, meta);
    assert.equal(params.get('accent'), '#8B5CF6');
    assert.equal(params.get('radius'), 'balanced');
    assert.equal(params.get('font'), 'mono');
    assert.equal(params.get('density'), 'comfortable');
    assert.equal(params.get('copy.brandName'), 'Vektor');
    assert.equal(params.get('copy.headline'), null);
    assert.equal(params.get('copy.ctaLabel'), 'Deploy Now');

    const parsed = parseCustomizationParams(params.toString(), meta);
    assert.deepEqual(parsed, {
      tokens: {
        accentColor: '#8B5CF6',
        radiusScale: 'balanced',
        fontFamily: 'mono',
        density: 'comfortable',
      },
      copy: {
        brandName: 'Vektor',
        headline: 'Build faster',
        ctaLabel: 'Deploy Now',
      },
    });
  });

  it('rejects invalid hex/enum params and normalizes lowercase hex on parse', () => {
    const meta = makeMeta();

    const validLower = parseCustomizationParams('?accent=%2306b6d4&radius=sharp&font=sans&density=compact', meta);
    assert.deepEqual(validLower.tokens, {
      accentColor: '#06B6D4',
      radiusScale: 'sharp',
      fontFamily: 'sans',
      density: 'compact',
    });

    for (const badAccent of ['#fff', 'blue', '#12345g', '06b6d4']) {
      const search = new URLSearchParams({
        accent: badAccent,
        radius: 'invalid-radius',
        font: 'invalid-font',
        density: 'invalid-density',
      }).toString();
      const parsed = parseCustomizationParams(search, meta);
      assert.deepEqual(parsed.tokens, DEFAULT_THEME_TOKENS, `badAccent=${badAccent}`);
    }
  });

  it('ignores unknown copy.* keys when meta has customFields and ignores blank copy values', () => {
    const meta = makeMeta();
    const search = new URLSearchParams({
      'copy.brandName': 'Northstar',
      'copy.headline': '   ',
      'copy.unknownField': 'Malicious',
      'copy.': 'EmptyKey',
    }).toString();

    const parsed = parseCustomizationParams(search, meta);
    assert.deepEqual(parsed.copy, {
      brandName: 'Northstar',
      headline: 'Build faster',
      ctaLabel: 'Get Started',
    });
  });

  it('enforces /^[a-zA-Z0-9_.-]+$/ on copy.* keys when meta is omitted', () => {
    const search = new URLSearchParams({
      'copy.brand_Name-1.title': 'Valid Value',
      'copy.bad key': 'Invalid space',
      'copy.bad$key': 'Invalid dollar',
      'copy.bad/key': 'Invalid slash',
      'copy.blank': '   \t  ',
      'copy.': 'Empty key',
    }).toString();

    const parsed = parseCustomizationParams(search);
    assert.deepEqual(parsed.copy, {
      'brand_Name-1.title': 'Valid Value',
    });
  });

  it('parses ?scheme=<id> presets and gives individual token params precedence over scheme', () => {
    const meta = makeMeta();

    const fromScheme = parseCustomizationParams('?scheme=midnight-glass', meta);
    assert.deepEqual(fromScheme.tokens, {
      accentColor: '#38BDF8',
      radiusScale: 'rounded',
      fontFamily: 'sans',
      density: 'comfortable',
    });

    const caseInsensitive = parseCustomizationParams('?scheme=PHOSPHOR-NOC', meta);
    assert.deepEqual(caseInsensitive.tokens, {
      accentColor: '#22C55E',
      radiusScale: 'sharp',
      fontFamily: 'mono',
      density: 'compact',
    });

    const overridden = parseCustomizationParams(
      '?scheme=midnight-glass&accent=%23ff4500&density=compact&copy.brandName=Orbit',
      meta,
    );
    assert.deepEqual(overridden, {
      tokens: {
        accentColor: '#FF4500',
        radiusScale: 'rounded',
        fontFamily: 'sans',
        density: 'compact',
      },
      copy: {
        brandName: 'Orbit',
        headline: 'Build faster',
        ctaLabel: 'Get Started',
      },
    });

    const invalidOverridesIgnored = parseCustomizationParams(
      '?scheme=phosphor-noc&accent=not-hex&radius=huge&font=comic&density=ultra',
      meta,
    );
    assert.deepEqual(invalidOverridesIgnored.tokens, {
      accentColor: '#22C55E',
      radiusScale: 'sharp',
      fontFamily: 'mono',
      density: 'compact',
    });

    const unknownScheme = parseCustomizationParams('?scheme=unknown-preset', meta);
    assert.deepEqual(unknownScheme.tokens, DEFAULT_THEME_TOKENS);
  });
});

describe('buildStageStyleAndAttrs', () => {
  it('returns default stage attrs without custom style or overrides when inactive/invalid', () => {
    const fromUndefined = buildStageStyleAndAttrs(undefined);
    assert.deepEqual(fromUndefined.style, {});
    assert.deepEqual(fromUndefined.dataAttrs, {
      'data-template-stage': 'true',
      'data-accent-family': undefined,
      'data-custom-accent': undefined,
      'data-custom-radius': undefined,
      'data-custom-font': undefined,
      'data-custom-density': undefined,
    });

    const fromInvalid = buildStageStyleAndAttrs(
      {
        tokens: {
          accentColor: '#fff',
          radiusScale: 'invalid',
          fontFamily: 'default',
          density: 'invalid',
        },
        copy: {},
      },
      'violet',
    );
    assert.deepEqual(fromInvalid.style, {});
    assert.deepEqual(fromInvalid.dataAttrs, {
      'data-template-stage': 'true',
      'data-accent-family': 'violet',
      'data-custom-accent': undefined,
      'data-custom-radius': undefined,
      'data-custom-font': undefined,
      'data-custom-density': undefined,
    });
  });

  it('sets --ui-custom-accent (uppercased) and active data-custom-* attributes', () => {
    const result = buildStageStyleAndAttrs(
      {
        tokens: {
          accentColor: '#f43f5e',
          radiusScale: 'rounded',
          fontFamily: 'mono',
          density: 'spacious',
        },
        copy: {},
      },
      'emerald',
    );

    assert.deepEqual(result.style, {
      '--ui-custom-accent': '#F43F5E',
    });
    assert.deepEqual(result.dataAttrs, {
      'data-template-stage': 'true',
      'data-accent-family': 'emerald',
      'data-custom-accent': 'true',
      'data-custom-radius': 'rounded',
      'data-custom-font': 'mono',
      'data-custom-density': 'spacious',
    });
  });
});
