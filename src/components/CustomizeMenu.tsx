import {
  Check,
  Code2,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Terminal,
  Type,
  X,
} from 'lucide-react';
import {
  ACCENT_PRESETS,
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
} from '../templates/customize';
import type {
  DensityChoice,
  FontFamilyChoice,
  RadiusScale,
  TemplateCustomization,
  TemplateEntry,
} from '../templates/types';

export interface CustomizeMenuProps {
  template: TemplateEntry;
  customization: TemplateCustomization;
  activeCount: number;
  onChange: (next: TemplateCustomization) => void;
  onReset: () => void;
  onClose: () => void;
  onJumpToTab: (tab: 'raw' | 'prompt') => void;
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export default function CustomizeMenu({
  template,
  customization,
  activeCount,
  onChange,
  onReset,
  onClose,
  onJumpToTab,
}: CustomizeMenuProps) {
  const { tokens, copy } = customization;
  const customFields = template.meta.customFields ?? [];

  const isCustomAccent =
    tokens.accentColor !== 'default' && HEX_COLOR_RE.test(tokens.accentColor);
  const colorPickerValue = isCustomAccent
    ? tokens.accentColor
    : HEX_COLOR_RE.test(template.meta.swatchAccent)
      ? template.meta.swatchAccent
      : '#38BDF8';

  const updateToken = <K extends keyof TemplateCustomization['tokens']>(
    key: K,
    value: TemplateCustomization['tokens'][K],
  ) => {
    onChange({
      ...customization,
      tokens: {
        ...tokens,
        [key]: value,
      },
    });
  };

  const updateCopyField = (key: string, value: string) => {
    onChange({
      ...customization,
      copy: {
        ...copy,
        [key]: value,
      },
    });
  };

  const handleAccentSelect = (value: string) => {
    updateToken('accentColor', value === 'default' ? 'default' : value.toUpperCase());
  };

  const handleRadiusSelect = (value: RadiusScale) => {
    updateToken('radiusScale', value);
  };

  const handleFontSelect = (value: FontFamilyChoice) => {
    updateToken('fontFamily', value);
  };

  const handleDensitySelect = (value: DensityChoice) => {
    updateToken('density', value);
  };

  return (
    <div className="flex h-full flex-col bg-[#0A0A0B] text-zinc-100">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-sky-400" />
          <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-100">
            Customize
          </h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            disabled={activeCount === 0}
            onClick={onReset}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
              activeCount === 0
                ? 'cursor-not-allowed border-zinc-800/60 bg-zinc-950 text-zinc-600'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close customize menu"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Section 1: Visual Tokens */}
        <section className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-zinc-500" />
            <h4 className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
              Visual Tokens
            </h4>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-300">
                Accent Color
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                {isCustomAccent ? tokens.accentColor.toUpperCase() : 'Default'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((preset) => {
                const selected =
                  preset.value === 'default'
                    ? !isCustomAccent
                    : isCustomAccent &&
                      tokens.accentColor.toUpperCase() ===
                        preset.value.toUpperCase();
                const displaySwatch =
                  preset.value === 'default'
                    ? template.meta.swatchAccent || preset.swatch
                    : preset.swatch;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={
                      preset.value === 'default'
                        ? `Default (${template.meta.swatchAccent})`
                        : `${preset.label} (${preset.value})`
                    }
                    aria-label={`Accent ${preset.label}`}
                    aria-pressed={selected}
                    onClick={() => handleAccentSelect(preset.value)}
                    className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
                      selected
                        ? 'scale-105 border-white ring-2 ring-sky-400/60 ring-offset-2 ring-offset-[#0A0A0B]'
                        : 'border-zinc-700/80 hover:scale-105 hover:border-zinc-500'
                    }`}
                    style={{ backgroundColor: displaySwatch }}
                  >
                    {preset.value === 'default' ? (
                      <span className="rounded-full bg-zinc-950/75 px-1 text-[8px] font-bold tracking-tight text-white">
                        DEF
                      </span>
                    ) : selected ? (
                      <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                    ) : null}
                  </button>
                );
              })}

              {/* Native Color Picker */}
              <label
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                  isCustomAccent &&
                  !ACCENT_PRESETS.some(
                    (p) =>
                      p.value !== 'default' &&
                      p.value.toUpperCase() ===
                        tokens.accentColor.toUpperCase(),
                  )
                    ? 'border-sky-500/60 bg-sky-950/40 text-sky-200'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <input
                  type="color"
                  aria-label="Custom accent hex color"
                  value={colorPickerValue}
                  onChange={(e) => handleAccentSelect(e.target.value)}
                  className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="font-mono text-[10px] uppercase">
                  {colorPickerValue}
                </span>
              </label>
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">
                Border Radius
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {tokens.radiusScale}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-1">
              {RADIUS_OPTIONS.map((option) => {
                const active = tokens.radiusScale === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleRadiusSelect(option.value)}
                    className={`flex-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">
                Typography
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {tokens.fontFamily}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-1">
              {FONT_OPTIONS.map((option) => {
                const active = tokens.fontFamily === option.value;
                const fontPreviewClass =
                  option.value === 'serif'
                    ? 'font-serif'
                    : option.value === 'mono'
                      ? 'font-mono'
                      : 'font-sans';
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleFontSelect(option.value)}
                    className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition ${fontPreviewClass} ${
                      active
                        ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Density</span>
              <span className="font-mono text-[11px] text-zinc-500">
                {tokens.density}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-1">
              {DENSITY_OPTIONS.map((option) => {
                const active = tokens.density === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleDensitySelect(option.value)}
                    className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition ${
                      active
                        ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-800/80" />

        {/* Section 2: Copy & Props */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-zinc-500" />
              <h4 className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                Copy &amp; Props
              </h4>
            </div>
            {customFields.length > 0 && (
              <span className="font-mono text-[10px] text-zinc-500">
                {customFields.length} fields
              </span>
            )}
          </div>

          {customFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800/90 bg-zinc-950/60 p-3 text-xs text-zinc-500">
              No editable copy props defined for this template.
            </div>
          ) : (
            <div className="space-y-3">
              {customFields.map((field) => {
                const value = copy[field.key] ?? field.defaultValue;
                const isModified = value !== field.defaultValue;
                const inputId = `customize-field-${template.meta.slug}-${field.key}`;

                return (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={inputId}
                        className="text-xs font-medium text-zinc-300"
                      >
                        {field.label}
                      </label>
                      {isModified && (
                        <button
                          type="button"
                          onClick={() =>
                            updateCopyField(field.key, field.defaultValue)
                          }
                          title={`Reset ${field.label} to default`}
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-sky-400 transition hover:bg-sky-500/10 hover:text-sky-300"
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {field.multiline ? (
                      <textarea
                        id={inputId}
                        rows={3}
                        value={value}
                        placeholder={field.placeholder ?? field.defaultValue}
                        onChange={(e) =>
                          updateCopyField(field.key, e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                      />
                    ) : (
                      <input
                        id={inputId}
                        type="text"
                        value={value}
                        placeholder={field.placeholder ?? field.defaultValue}
                        onChange={(e) =>
                          updateCopyField(field.key, e.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="space-y-2.5 border-t border-zinc-800/80 bg-zinc-950/70 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
          />
          <span>Live-synced to Preview, Agent Raw &amp; 1-Line Prompt</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onJumpToTab('raw')}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Code2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>Agent Raw</span>
          </button>
          <button
            type="button"
            onClick={() => onJumpToTab('prompt')}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            <span>1-Line Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
