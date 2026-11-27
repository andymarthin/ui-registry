import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildOneLinePrompt,
  buildPreviewHref,
  buildRawManifestUrl,
  resolveBaseUrl,
} from '../src/templates/prompt.ts';

const SAMPLE_META = {
  slug: 'glass-portfolio',
  name: 'Liquid Glass Portfolio',
  category: 'Portfolio',
  styleTag: 'Liquid Glass',
  styleFull: 'Liquid Glass + Refractive Spheres',
  swatchBg: '#05060D',
  swatchAccent: '#60A5FA',
  swatchBorder: '#1E293B',
  accentFamily: 'sky',
  description: 'Sample portfolio',
  dependencies: ['lucide-react'],
  targetDir: 'src/components/glass-portfolio',
  defaultInstruction: 'Wire your data via props.',
  customFields: [
    {
      key: 'brandName',
      label: 'Name / Brand',
      defaultValue: 'Soren Vance',
    },
    {
      key: 'headline',
      label: 'Hero Headline',
      defaultValue: 'Crafting tactile, optical software',
    },
  ],
};

describe('resolveBaseUrl', () => {
  it('trims whitespace and strips trailing slashes', () => {
    assert.equal(
      resolveBaseUrl({ baseUrl: '  https://example.com///  ' }),
      'https://example.com',
    );
    assert.equal(
      resolveBaseUrl({ baseUrl: 'https://andymarthin.github.io/ui-registy/' }),
      'https://andymarthin.github.io/ui-registy',
    );
  });

  it('honors fallback priority: baseUrl -> envBaseUrl -> detectedOrigin -> fallbackOrigin', () => {
    assert.equal(
      resolveBaseUrl({
        baseUrl: 'https://custom.example.com/',
        envBaseUrl: 'https://env.example.com/',
        detectedOrigin: 'https://detected.example.com/',
        fallbackOrigin: 'https://fallback.example.com/',
      }),
      'https://custom.example.com',
    );

    assert.equal(
      resolveBaseUrl({
        baseUrl: '   ',
        envBaseUrl: ' https://env.example.com// ',
        detectedOrigin: 'https://detected.example.com/',
        fallbackOrigin: 'https://fallback.example.com/',
      }),
      'https://env.example.com',
    );

    assert.equal(
      resolveBaseUrl({
        baseUrl: '',
        envBaseUrl: '',
        detectedOrigin: 'https://detected.example.com/',
        fallbackOrigin: 'https://fallback.example.com/',
      }),
      'https://detected.example.com',
    );

    assert.equal(
      resolveBaseUrl({
        baseUrl: '',
        envBaseUrl: undefined,
        detectedOrigin: '  ',
        fallbackOrigin: 'https://fallback.example.com///',
      }),
      'https://fallback.example.com',
    );
  });

  it('returns empty string when all candidates are empty or undefined', () => {
    assert.equal(resolveBaseUrl({ baseUrl: '' }), '');
    assert.equal(
      resolveBaseUrl({
        baseUrl: '   ',
        envBaseUrl: '',
        detectedOrigin: undefined,
        fallbackOrigin: '  ',
      }),
      '',
    );
  });
});

describe('buildRawManifestUrl', () => {
  it('builds /r/<slug>.md for root and subpath bases while stripping extra trailing slashes', () => {
    assert.equal(
      buildRawManifestUrl('https://example.com', 'glass-portfolio'),
      'https://example.com/r/glass-portfolio.md',
    );
    assert.equal(
      buildRawManifestUrl('  https://example.com/// ', 'saas-landing'),
      'https://example.com/r/saas-landing.md',
    );
    assert.equal(
      buildRawManifestUrl(
        'https://andymarthin.github.io/ui-registy',
        'logistics-hub',
      ),
      'https://andymarthin.github.io/ui-registy/r/logistics-hub.md',
    );
    assert.equal(
      buildRawManifestUrl(
        'https://andymarthin.github.io/ui-registy///',
        'logistics-hub',
      ),
      'https://andymarthin.github.io/ui-registy/r/logistics-hub.md',
    );
  });
});

describe('buildPreviewHref', () => {
  it('handles root and subpath base paths without a slug', () => {
    assert.equal(buildPreviewHref({ basePath: '' }), '/');
    assert.equal(buildPreviewHref({ basePath: '/' }), '/');
    assert.equal(buildPreviewHref({ basePath: '/ui-registy' }), '/ui-registy/');
    assert.equal(
      buildPreviewHref({ basePath: '/ui-registy/' }),
      '/ui-registy/',
    );
  });

  it('builds uncustomized preview URLs without query parameters', () => {
    assert.equal(
      buildPreviewHref({ basePath: '', slug: 'glass-portfolio' }),
      '/preview/glass-portfolio/',
    );
    assert.equal(
      buildPreviewHref({ basePath: '/ui-registy', slug: 'glass-portfolio' }),
      '/ui-registy/preview/glass-portfolio/',
    );

    const defaultCustomization = {
      tokens: {
        accentColor: 'default',
        radiusScale: 'default',
        fontFamily: 'default',
        density: 'default',
      },
      copy: {
        brandName: 'Soren Vance',
      },
    };
    const href = buildPreviewHref({
      basePath: '/ui-registy/',
      slug: 'glass-portfolio',
      customization: defaultCustomization,
      meta: SAMPLE_META,
    });
    assert.equal(href, '/ui-registy/preview/glass-portfolio/');
    assert.ok(!href.includes('?'));
  });

  it('serializes active customization parameters into preview query string', () => {
    const customization = {
      tokens: {
        accentColor: '#38bdf8',
        radiusScale: 'pill',
        fontFamily: 'mono',
        density: 'compact',
      },
      copy: {
        brandName: 'Nova Lab',
        headline: 'Crafting tactile, optical software', // matches default -> omitted
      },
    };

    const rootHref = buildPreviewHref({
      basePath: '',
      slug: 'glass-portfolio',
      customization,
      meta: SAMPLE_META,
    });
    assert.equal(
      rootHref,
      '/preview/glass-portfolio/?accent=%2338BDF8&radius=pill&font=mono&density=compact&copy.brandName=Nova+Lab',
    );

    const subpathHref = buildPreviewHref({
      basePath: '/ui-registy',
      slug: 'glass-portfolio',
      customization,
      meta: SAMPLE_META,
    });
    assert.equal(
      subpathHref,
      '/ui-registy/preview/glass-portfolio/?accent=%2338BDF8&radius=pill&font=mono&density=compact&copy.brandName=Nova+Lab',
    );
  });
});

describe('buildOneLinePrompt', () => {
  const baseOptions = {
    rawManifestUrl: 'https://example.com/r/glass-portfolio.md',
    targetDir: 'src/components/glass-portfolio',
    defaultTargetDir: 'src/components/glass-portfolio',
    instruction: 'Wire your data via props.',
    defaultInstruction: 'Default instruction.',
    strictVerbatim: true,
    bearerAuth: false,
    customClause: '',
  };

  it('formats all 4 combinations of strictVerbatim x customClause', () => {
    assert.equal(
      buildOneLinePrompt({
        ...baseOptions,
        strictVerbatim: true,
        customClause: '',
      }),
      'Run `curl -s https://example.com/r/glass-portfolio.md`, write every file verbatim to `src/components/glass-portfolio` without altering colors, typography, border radius, or layout geometry, and wire data only via component props: Wire your data via props.',
    );

    assert.equal(
      buildOneLinePrompt({
        ...baseOptions,
        strictVerbatim: true,
        customClause: 'accent=#38BDF8, radius=pill',
      }),
      'Run `curl -s https://example.com/r/glass-portfolio.md`, write every file verbatim to `src/components/glass-portfolio` preserving layout geometry while applying these customizations: accent=#38BDF8, radius=pill, and wire data only via component props: Wire your data via props.',
    );

    assert.equal(
      buildOneLinePrompt({
        ...baseOptions,
        strictVerbatim: false,
        customClause: '',
      }),
      'Run `curl -s https://example.com/r/glass-portfolio.md` to inspect the template manifest, write the components into `src/components/glass-portfolio` adapting styling as needed, and wire data via component props: Wire your data via props.',
    );

    assert.equal(
      buildOneLinePrompt({
        ...baseOptions,
        strictVerbatim: false,
        customClause: 'accent=#38BDF8, radius=pill',
      }),
      'Run `curl -s https://example.com/r/glass-portfolio.md` to inspect the template manifest, write the components into `src/components/glass-portfolio` adapting styling as needed while applying these customizations: accent=#38BDF8, radius=pill, and wire data via component props: Wire your data via props.',
    );
  });

  it('includes or omits Bearer auth header based on bearerAuth', () => {
    const withAuth = buildOneLinePrompt({
      ...baseOptions,
      bearerAuth: true,
    });
    assert.ok(
      withAuth.includes(
        'curl -s -H "Authorization: Bearer $UI_HUB_TOKEN" https://example.com/r/glass-portfolio.md',
      ),
    );

    const withoutAuth = buildOneLinePrompt({
      ...baseOptions,
      bearerAuth: false,
    });
    assert.ok(!withoutAuth.includes('$UI_HUB_TOKEN'));
    assert.ok(!withoutAuth.includes('Authorization: Bearer'));
  });

  it('collapses whitespace in targetDir and instruction, falls back instruction to default, and switches blank targetDir to auto-detect', () => {
    const collapsed = buildOneLinePrompt({
      ...baseOptions,
      targetDir: '  src/ui/\n\t  custom-dir  ',
      instruction: '  Fetch   from\n\t/api/portfolio   endpoint.  ',
    });
    assert.ok(collapsed.includes('`src/ui/ custom-dir`'));
    assert.ok(collapsed.endsWith(': Fetch from /api/portfolio endpoint.'));

    const autoPhrase =
      "into the appropriate components directory matching this repository's existing folder structure";

    const autoStrict = buildOneLinePrompt({
      ...baseOptions,
      targetDir: '   \n\t  ',
      instruction: '  \n  ',
      strictVerbatim: true,
      customClause: '',
    });
    assert.equal(
      autoStrict,
      `Run \`curl -s https://example.com/r/glass-portfolio.md\`, write every file verbatim ${autoPhrase} without altering colors, typography, border radius, or layout geometry, and wire data only via component props: Default instruction.`,
    );

    const autoStrictCustom = buildOneLinePrompt({
      ...baseOptions,
      targetDir: '',
      strictVerbatim: true,
      customClause: 'accent=#38BDF8',
    });
    assert.equal(
      autoStrictCustom,
      `Run \`curl -s https://example.com/r/glass-portfolio.md\`, write every file verbatim ${autoPhrase} preserving layout geometry while applying these customizations: accent=#38BDF8, and wire data only via component props: Wire your data via props.`,
    );

    const autoAdapt = buildOneLinePrompt({
      ...baseOptions,
      targetDir: '',
      strictVerbatim: false,
      customClause: '',
    });
    assert.equal(
      autoAdapt,
      `Run \`curl -s https://example.com/r/glass-portfolio.md\` to inspect the template manifest, write the components ${autoPhrase} adapting styling as needed, and wire data via component props: Wire your data via props.`,
    );

    const autoAdaptCustom = buildOneLinePrompt({
      ...baseOptions,
      targetDir: '',
      strictVerbatim: false,
      customClause: 'radius=pill',
    });
    assert.equal(
      autoAdaptCustom,
      `Run \`curl -s https://example.com/r/glass-portfolio.md\` to inspect the template manifest, write the components ${autoPhrase} adapting styling as needed while applying these customizations: radius=pill, and wire data via component props: Wire your data via props.`,
    );
  });
});
