import type {
  DensityChoice,
  DesignSurfaceMode,
  FontFamilyChoice,
  RadiusScale,
  TemplateCustomization,
  TemplateDesignSchema,
  TemplateMeta,
  TemplateThemeTokens,
  ThemeSchemePreset,
} from './types';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const BASE_DEFAULT_TOKENS: TemplateThemeTokens = {
  accentColor: 'default',
  radiusScale: 'default',
  fontFamily: 'default',
  density: 'default',
};

export const THEME_SCHEMES: readonly ThemeSchemePreset[] = [
  {
    id: 'default',
    name: 'Template Default',
    description: 'Preserve the template’s original palette, radius, typography, and spacing.',
    swatchBg: '#09090B',
    swatchAccent: '#71717A',
    swatchBorder: '#27272A',
    tokens: {
      accentColor: 'default',
      radiusScale: 'default',
      fontFamily: 'default',
      density: 'default',
    },
  },
  {
    id: 'midnight-glass',
    name: 'Midnight Glass',
    description: 'Deep nocturnal slate with sky cyan highlights, rounded glass surfaces, and sans typography.',
    swatchBg: '#05060D',
    swatchAccent: '#38BDF8',
    swatchBorder: '#1E293B',
    tokens: {
      accentColor: '#38BDF8',
      radiusScale: 'rounded',
      fontFamily: 'sans',
      density: 'comfortable',
    },
  },
  {
    id: 'swiss-brutalist',
    name: 'Swiss Brutalist',
    description: 'High-contrast paper canvas with signal orange accents, crisp 0px edges, and compact mono grid.',
    swatchBg: '#FAFAFA',
    swatchAccent: '#FF4500',
    swatchBorder: '#0A0A0A',
    tokens: {
      accentColor: '#FF4500',
      radiusScale: 'sharp',
      fontFamily: 'mono',
      density: 'compact',
    },
  },
  {
    id: 'editorial-paper',
    name: 'Editorial Paper',
    description: 'Warm newsprint tones with terracotta accents, sharp rules, editorial serif type, and spacious rhythm.',
    swatchBg: '#F5F2EB',
    swatchAccent: '#9A3412',
    swatchBorder: '#D6D0C4',
    tokens: {
      accentColor: '#9A3412',
      radiusScale: 'sharp',
      fontFamily: 'serif',
      density: 'spacious',
    },
  },
  {
    id: 'phosphor-noc',
    name: 'Phosphor NOC',
    description: 'Pitch-black telemetry console with phosphor green accents, sharp frames, and dense monospace type.',
    swatchBg: '#050505',
    swatchAccent: '#22C55E',
    swatchBorder: '#1F2937',
    tokens: {
      accentColor: '#22C55E',
      radiusScale: 'sharp',
      fontFamily: 'mono',
      density: 'compact',
    },
  },
  {
    id: 'soft-bento',
    name: 'Soft Bento Glow',
    description: 'Charcoal bento canvas with violet glow accents, pill controls, and comfortable sans layout.',
    swatchBg: '#09090B',
    swatchAccent: '#8B5CF6',
    swatchBorder: '#27272A',
    tokens: {
      accentColor: '#8B5CF6',
      radiusScale: 'pill',
      fontFamily: 'sans',
      density: 'comfortable',
    },
  },
  {
    id: 'enterprise-blue',
    name: 'Enterprise Utility',
    description: 'Crisp light workspace with cobalt blue actions, balanced radii, and compact sans density.',
    swatchBg: '#FFFFFF',
    swatchAccent: '#2563EB',
    swatchBorder: '#E2E8F0',
    tokens: {
      accentColor: '#2563EB',
      radiusScale: 'balanced',
      fontFamily: 'sans',
      density: 'compact',
    },
  },
] as const;

const RADIUS_DESCRIPTIONS: Record<Exclude<RadiusScale, 'default'>, string> = {
  sharp: '0px sharp corners (rounded-none; preserve circular status dots/avatars)',
  balanced: '0.25rem–0.75rem subtle balanced radii (rounded-md / rounded-lg)',
  rounded: '0.5rem–1.5rem generous rounded radii (rounded-xl / rounded-2xl)',
  pill: '9999px pill controls with 1.5rem–2.5rem extra-rounded cards (rounded-full / rounded-3xl)',
};

const FONT_DESCRIPTIONS: Record<Exclude<FontFamilyChoice, 'default'>, string> = {
  sans: 'Modern geometric sans-serif (font-sans)',
  serif: 'Editorial serif (font-serif)',
  mono: 'Technical monospace (font-mono)',
};

const DENSITY_DESCRIPTIONS: Record<Exclude<DensityChoice, 'default'>, string> = {
  compact: 'Compact rhythm (--spacing: 0.21rem, tighter card/table padding)',
  comfortable: 'Comfortable rhythm (--spacing: 0.25rem, balanced padding)',
  spacious: 'Spacious rhythm (--spacing: 0.29rem, generous breathing room)',
};

function getHexLuminance(hex: string): number | null {
  if (!HEX_COLOR_RE.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function inferSurfaceMode(hex: string): DesignSurfaceMode {
  const lum = getHexLuminance(hex);
  if (lum === null) return 'dark';
  return lum > 0.55 ? 'light' : 'dark';
}

function inferContrastForeground(hex: string): string {
  const lum = getHexLuminance(hex);
  if (lum === null) return '#FFFFFF';
  return lum > 0.55 ? '#09090B' : '#FFFFFF';
}

function cloneDesignSchema(design: TemplateDesignSchema): TemplateDesignSchema {
  return {
    ...design,
    palette: {
      ...design.palette,
      semantic: design.palette.semantic ? { ...design.palette.semantic } : undefined,
    },
    typography: { ...design.typography },
    geometry: { ...design.geometry },
    components: [...design.components],
    doRules: [...design.doRules],
    dontRules: [...design.dontRules],
  };
}

function synthesizeFallbackDesignSchema(meta: TemplateMeta): TemplateDesignSchema {
  const mode = inferSurfaceMode(meta.swatchBg);
  const isLight = mode === 'light';
  return {
    id: `${meta.slug}-default`,
    version: '1.0.0',
    mode,
    summary: meta.description || meta.styleFull,
    palette: {
      canvas: meta.swatchBg,
      surface: isLight ? '#FFFFFF' : '#111114',
      surfaceElevated: isLight ? '#F4F4F5' : '#18181B',
      text: isLight ? '#09090B' : '#FAFAFA',
      textMuted: isLight ? '#52525B' : '#A1A1AA',
      border: meta.swatchBorder,
      accent: meta.swatchAccent,
      accentForeground: inferContrastForeground(meta.swatchAccent),
    },
    typography: {
      display: 'Inter / system sans-serif',
      body: 'Inter / system sans-serif',
      mono: 'JetBrains Mono / ui-monospace',
      headingScale: 'text-2xl to text-4xl font-semibold tracking-tight',
      bodyScale: 'text-sm leading-relaxed',
    },
    geometry: {
      radius: 'rounded-xl (0.75rem)',
      borderStyle: `1px solid ${meta.swatchBorder}`,
      spacing: '4px base grid (--spacing: 0.25rem)',
      containerMaxWidth: 'max-w-7xl',
    },
    elevation: isLight
      ? 'Subtle hairline borders with soft ambient shadow'
      : 'Hairline borders with restrained surface contrast',
    motion: '150ms–200ms ease-out hover and focus transitions',
    components: [
      'Top header or navigation bar',
      'Primary content cards and structured panels',
      'Interactive controls and data display',
    ],
    doRules: [
      'Preserve layout hierarchy and visual token contrast.',
      'Wire domain data and labels through typed component props.',
      'Keep spacing and surface borders consistent across new sections.',
    ],
    dontRules: [
      'Do not introduce unstyled default browser controls or mismatched palettes.',
      'Do not hardcode domain data directly inside presentational layout blocks.',
    ],
  };
}

/**
 * Looks up a theme scheme preset by ID (case-insensitive, trimmed).
 */
export function getThemeSchemeById(
  id: string | null | undefined,
): ThemeSchemePreset | undefined {
  const clean = id?.trim().toLowerCase();
  if (!clean) return undefined;
  return THEME_SCHEMES.find((scheme) => scheme.id === clean);
}

/**
 * Applies a theme scheme preset's visual tokens while preserving copy overrides.
 */
export function applyThemeScheme(
  customization: TemplateCustomization,
  schemeId: string,
): TemplateCustomization {
  const preset = getThemeSchemeById(schemeId);
  const nextTokens = preset ? { ...preset.tokens } : { ...BASE_DEFAULT_TOKENS };
  return {
    tokens: nextTokens,
    copy: { ...customization.copy },
  };
}

/**
 * Finds a non-default preset matching all four theme tokens (case-insensitive on accentColor).
 */
export function matchThemeScheme(
  tokens: TemplateThemeTokens,
): ThemeSchemePreset | undefined {
  const normalizedAccent = tokens.accentColor.trim().toLowerCase();
  return THEME_SCHEMES.find(
    (scheme) =>
      scheme.id !== 'default' &&
      scheme.tokens.accentColor.toLowerCase() === normalizedAccent &&
      scheme.tokens.radiusScale === tokens.radiusScale &&
      scheme.tokens.fontFamily === tokens.fontFamily &&
      scheme.tokens.density === tokens.density,
  );
}

/**
 * Resolves the effective design schema for a template, merging any active token overrides.
 */
export function resolveEffectiveDesignSchema(
  meta: TemplateMeta,
  customization?: TemplateCustomization,
): TemplateDesignSchema {
  const resolved = meta.design
    ? cloneDesignSchema(meta.design)
    : synthesizeFallbackDesignSchema(meta);

  if (!customization) {
    return resolved;
  }

  const { tokens } = customization;

  if (
    typeof tokens.accentColor === 'string' &&
    tokens.accentColor !== 'default' &&
    HEX_COLOR_RE.test(tokens.accentColor)
  ) {
    const accentHex = tokens.accentColor.toUpperCase();
    resolved.palette.accent = accentHex;
    resolved.palette.accentForeground = inferContrastForeground(accentHex);
  }

  if (tokens.radiusScale !== 'default' && tokens.radiusScale in RADIUS_DESCRIPTIONS) {
    resolved.geometry.radius =
      RADIUS_DESCRIPTIONS[tokens.radiusScale as Exclude<RadiusScale, 'default'>];
  }

  if (tokens.fontFamily !== 'default' && tokens.fontFamily in FONT_DESCRIPTIONS) {
    const fontDesc =
      FONT_DESCRIPTIONS[tokens.fontFamily as Exclude<FontFamilyChoice, 'default'>];
    resolved.typography.display = fontDesc;
    resolved.typography.body = fontDesc;
  }

  if (tokens.density !== 'default' && tokens.density in DENSITY_DESCRIPTIONS) {
    resolved.geometry.spacing =
      DENSITY_DESCRIPTIONS[tokens.density as Exclude<DensityChoice, 'default'>];
  }

  return resolved;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates a TemplateDesignSchema object and returns human-readable error strings.
 */
export function validateDesignSchema(design: unknown, label = 'design'): string[] {
  if (!isPlainObject(design)) {
    return [`${label} must be a non-null object`];
  }

  const errors: string[] = [];

  for (const field of ['id', 'version', 'summary', 'elevation', 'motion'] as const) {
    if (!isNonEmptyString(design[field])) {
      errors.push(`${label}.${field} must be a non-empty string`);
    }
  }

  if (design.mode !== 'dark' && design.mode !== 'light') {
    errors.push(`${label}.mode must be 'dark' or 'light'`);
  }

  if (!isPlainObject(design.palette)) {
    errors.push(`${label}.palette must be a non-null object`);
  } else {
    const paletteFields = [
      'canvas',
      'surface',
      'surfaceElevated',
      'text',
      'textMuted',
      'border',
      'accent',
      'accentForeground',
    ] as const;
    for (const field of paletteFields) {
      if (!isNonEmptyString(design.palette[field])) {
        errors.push(`${label}.palette.${field} must be a non-empty string`);
      }
    }
    if (design.palette.semantic !== undefined) {
      if (!isPlainObject(design.palette.semantic)) {
        errors.push(`${label}.palette.semantic must be a non-null object when provided`);
      } else {
        for (const semKey of ['success', 'warning', 'danger', 'info'] as const) {
          const semVal = design.palette.semantic[semKey];
          if (semVal !== undefined && !isNonEmptyString(semVal)) {
            errors.push(`${label}.palette.semantic.${semKey} must be a non-empty string`);
          }
        }
      }
    }
  }

  if (!isPlainObject(design.typography)) {
    errors.push(`${label}.typography must be a non-null object`);
  } else {
    const typographyFields = [
      'display',
      'body',
      'mono',
      'headingScale',
      'bodyScale',
    ] as const;
    for (const field of typographyFields) {
      if (!isNonEmptyString(design.typography[field])) {
        errors.push(`${label}.typography.${field} must be a non-empty string`);
      }
    }
  }

  if (!isPlainObject(design.geometry)) {
    errors.push(`${label}.geometry must be a non-null object`);
  } else {
    const geometryFields = [
      'radius',
      'borderStyle',
      'spacing',
      'containerMaxWidth',
    ] as const;
    for (const field of geometryFields) {
      if (!isNonEmptyString(design.geometry[field])) {
        errors.push(`${label}.geometry.${field} must be a non-empty string`);
      }
    }
  }

  for (const listField of ['components', 'doRules', 'dontRules'] as const) {
    const listVal = design[listField];
    if (
      !Array.isArray(listVal) ||
      listVal.length === 0 ||
      !listVal.every((item) => isNonEmptyString(item))
    ) {
      errors.push(`${label}.${listField} must be a non-empty array of non-empty strings`);
    }
  }

  return errors;
}
