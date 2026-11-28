# Creating Templates

This guide explains how to add a new UI template to **UI Template Hub** so it appears automatically in the browser preview shell and is published as a raw Markdown manifest at `/r/<slug>.md`.

> **Adopting from an existing site or app?** See [`docs/adopting-from-live.md`](./adopting-from-live.md) for an end-to-end guide on auditing a live reference, replacing brand/IP assets, decoupling framework styles into standalone Tailwind v4 components, and hardening mobile layouts.

## 1. Folder Structure

Create a new directory under `src/templates/<slug>/` using a lowercase kebab-case slug:

```text
src/templates/
└── my-template/
    ├── meta.ts                 # Required: TemplateMeta metadata
    ├── Preview.tsx             # Required: Hub preview wrapper (excluded from /r/<slug>.md)
    ├── MyTemplateShell.tsx     # Deliverable standalone component(s)
    ├── MetricCard.tsx          # Optional additional standalone components
    ├── types.ts                # Optional helper/type modules (.ts)
    ├── layout/                 # Optional subfolders (layout/, widgets/, tables/, ...)
    │   └── Sidebar.tsx
    └── widgets/
        ├── index.ts
        └── KpiCard.tsx
```

- Every `.ts` and `.tsx` file under `src/templates/<slug>/` is collected recursively (`./*/**/*.ts` and `./*/**/*.tsx`) as a deliverable file, including files in subfolders such as `layout/`, `widgets/`, and `tables/` and helper/type `.ts` files.
- The top-level `meta.ts` and `Preview.tsx` are explicitly excluded from the generated `/r/<slug>.md` output.
- Deliverable files are sorted alphabetically by their relative path (for example `layout/Sidebar.tsx`) in the generated manifest, and each is written to `<targetDir>/<relative path>` with subfolders preserved. `.ts` files render in ```` ```ts ```` fences and `.tsx` files in ```` ```tsx ```` fences.
- `PREFERRED_ORDER` in `src/templates/registry.ts` places the core 6 templates first; any additional templates are sorted alphabetically by `slug` after them.

---

## 2. `meta.ts` Schema

Every template folder must export `meta: TemplateMeta` (defined in `src/templates/types.ts`).

### Valid `TemplateCategory` values

- `'Portfolio'`
- `'Web'`
- `'Analytics'`
- `'Infrastructure'`
- `'Logistics'`

### `TemplateMeta` fields

| Field | Type | Description |
| --- | --- | --- |
| `slug` | `string` | URL-safe slug matching the folder name; determines `/r/<slug>.md` |
| `name` | `string` | Human-readable template title shown in sidebar and Markdown `#` heading |
| `category` | `TemplateCategory` | One of the 5 allowed categories above |
| `styleTag` | `string` | Short badge label shown in the sidebar (e.g. `'Swiss Minimal'`) |
| `styleFull` | `string` | Full aesthetic description shown in the header and manifest metadata |
| `swatchBg` | `string` | Background hex color for the sidebar swatch dot (e.g. `'#09090B'`) |
| `swatchAccent` | `string` | Accent hex color for the sidebar swatch dot (e.g. `'#38BDF8'`) |
| `swatchBorder` | `string` | Border hex color for the sidebar swatch dot (e.g. `'#27272A'`) |
| `description` | `string` | Concise summary of layout, visual style, and interactive features |
| `dependencies` | `string[]` | External npm packages required by the deliverable components (e.g. `['tailwindcss', 'lucide-react']`) |
| `targetDir` | `string` | Default destination directory in consumer repos (e.g. `'src/components/my-template'`) |
| `defaultInstruction` | `string` | Default data/copy wiring prompt pre-filled in the **1-Line Prompt** tab |
| `design` | `TemplateDesignSchema` | Structured design system tokens, typography, geometry, patterns, and Do/Don't rules used to generate `DESIGN.md` and `/r/<slug>.design.md` |

### `TemplateDesignSchema` (`meta.design`)

Every `meta.ts` must include `design: TemplateDesignSchema` (defined in `src/templates/types.ts` and validated by `validateDesignSchema` in `src/templates/design-schema.ts`):

- `id` (`string`), `version` (`string`), `mode` (`'dark' | 'light'`), `summary` (`string`)
- `palette`: `canvas` (must match `meta.swatchBg` case-insensitively), `surface`, `surfaceElevated`, `text`, `textMuted`, `border`, `accent` (must match `meta.swatchAccent` case-insensitively), `accentForeground`, optional `semantic` (`success`, `warning`, `danger`, `info`)
- `typography`: `display`, `body`, `mono`, `headingScale`, `bodyScale`
- `geometry`: `radius`, `borderStyle`, `spacing`, `containerMaxWidth`
- `elevation` (`string`), `motion` (`string`)
- `components` (`string[]`, non-empty), `doRules` (`string[]`, non-empty), `dontRules` (`string[]`, non-empty)

> **Customize presets (`THEME_SCHEMES`):** In the Hub's **Customize** drawer, users can pick from 7 `THEME_SCHEMES` presets (`default`, `midnight-glass`, `swiss-brutalist`, `editorial-paper`, `phosphor-noc`, `soft-bento`, `enterprise-blue`) or override individual accent, radius, font, density, and copy values (or pass `?scheme=<id>` in preview URLs, where individual token params override `scheme`). `resolveEffectiveDesignSchema` merges those overrides into the generated `DESIGN.md`.

### Example `meta.ts`

```ts
import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  slug: 'my-template',
  name: 'Minimal Status Page',
  category: 'Infrastructure',
  styleTag: 'Swiss Dark',
  styleFull: 'Swiss Precision Dark Status Workspace',
  swatchBg: '#0B0D10',
  swatchAccent: '#10B981',
  swatchBorder: '#1F2937',
  description:
    'High-contrast uptime and incident status board with service health rows and historical latency bars.',
  dependencies: ['tailwindcss', 'lucide-react'],
  targetDir: 'src/components/my-template',
  defaultInstruction:
    'Wire the services array and incident log props to our /api/status endpoint without changing layout or styling.',
  design: {
    id: 'my-template-default',
    version: '1.0.0',
    mode: 'dark',
    summary: 'Swiss precision dark uptime console with emerald health telemetry.',
    palette: {
      canvas: '#0B0D10',
      surface: '#11141A',
      surfaceElevated: '#181C24',
      text: '#F4F4F5',
      textMuted: '#A1A1AA',
      border: '#1F2937',
      accent: '#10B981',
      accentForeground: '#052E16',
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
    typography: {
      display: 'Inter / system sans-serif',
      body: 'Inter / system sans-serif',
      mono: 'JetBrains Mono / ui-monospace',
      headingScale: 'text-2xl font-semibold tracking-tight',
      bodyScale: 'text-sm leading-relaxed',
    },
    geometry: {
      radius: 'rounded-lg (0.5rem)',
      borderStyle: '1px solid #1F2937',
      spacing: '4px base grid (--spacing: 0.25rem)',
      containerMaxWidth: 'max-w-5xl',
    },
    elevation: 'Hairline borders with restrained dark surface contrast',
    motion: '150ms ease-out filter tab and row hover transitions',
    components: [
      'StatusHeader with live telemetry badge and filter tabs',
      'ServiceList responsive 2-column service card grid',
    ],
    doRules: [
      'Use font-mono for regions, uptime percentages, and telemetry labels.',
      'Keep 1px #1F2937 borders on service cards.',
    ],
    dontRules: [
      'Do not replace dark surface hierarchy with bright white panels.',
      'Do not hardcode service records inside deliverable components.',
    ],
  },
};
```

---

## 3. Standalone Component Rules

Deliverable `.ts` / `.tsx` files are emitted **verbatim** inside `/r/<slug>.md` so coding agents can copy them directly into external React + Tailwind projects. Because of this:

1. **Allowed imports only:** Deliverable files may ONLY import:
   - `react`
   - `lucide-react` (or packages explicitly listed in `meta.dependencies`)
   - Relative imports (`./` or `../`) that resolve to another deliverable `.ts` / `.tsx` file strictly inside the same `src/templates/<slug>/` folder, including subfolders (for example `./MetricCard`, `./layout/Sidebar`, `../types`, or `./widgets` resolving to `widgets/index.ts`). Relative imports must never resolve to the top-level `Preview.tsx` or `meta.ts`, nor escape the template folder.
2. **Never import hub internals:** NEVER import `../../components/InspectBox`, `../types`, `../registry`, or any file outside `src/templates/<slug>/` inside a deliverable component.
3. **Typed props for all copy and data:** Export clean TypeScript interfaces and accept data/copy via props with sensible defaults where appropriate, so consumer apps can wire real data without editing layout or styling.
4. **Inspect Templates support:** Add `data-inspect-label="<ComponentOrSectionName>"` on major structural sections/cards. When Inspect Mode is active in the hub, `src/styles/global.css` automatically draws dashed `#38bdf8` outlines and floating top-left labels on `[data-inspect-mode="true"] [data-inspect-label]` without affecting layout geometry.
5. **Tailwind v4 utilities only:** Use standard Tailwind v4 utility classes directly in JSX (avoid custom CSS files or hub-specific global classes).
6. **Responsive across all 3 viewports:** Verify layouts render cleanly in the hub's **Desktop (`100%`)**, **Tablet (`768px`)**, and **Mobile (`390px`)** viewport modes without horizontal overflow.

### Example standalone component (`MyTemplateShell.tsx`)

```tsx
import { useState } from 'react';
import { Activity, CheckCircle2 } from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  region: string;
  uptime: string;
  status: 'operational' | 'degraded';
}

export interface MyTemplateShellProps {
  title: string;
  subtitle: string;
  services: ServiceItem[];
}

export function MyTemplateShell({
  title,
  subtitle,
  services,
}: MyTemplateShellProps) {
  const [filter, setFilter] = useState<'all' | 'operational' | 'degraded'>('all');

  const visible = services.filter((s) =>
    filter === 'all' ? true : s.status === filter,
  );

  return (
    <div className="min-h-full bg-[#0B0D10] p-6 text-zinc-100 sm:p-8">
      <header
        data-inspect-label="StatusHeader"
        className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
            Live Telemetry
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>

        <div className="flex gap-2">
          {(['all', 'operational', 'degraded'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                filter === tab
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <section
        data-inspect-label="ServiceList"
        className="grid gap-3 sm:grid-cols-2"
      >
        {visible.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <div>
              <div className="text-sm font-medium text-zinc-100">{service.name}</div>
              <div className="mt-0.5 font-mono text-xs text-zinc-500">
                {service.region}
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {service.uptime}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
```

---

## 4. Writing `Preview.tsx`

`Preview.tsx` is the hub-only harness that supplies realistic mock data to your standalone components. Because `registry.ts` excludes `Preview.tsx` from the raw file list, it is never included in `/r/<slug>.md` and **may** import `TemplatePreviewProps` from `../types` and `InspectBox` from `../../components/InspectBox`.

- Accept `{ inspect = false }: TemplatePreviewProps`.
- Wrap the root element with `data-inspect-mode={inspect ? 'true' : 'false'}` so any `data-inspect-label` attributes inside your deliverable components light up when Inspect Mode is toggled.
- Optionally wrap outer sections in `<InspectBox label="..." active={inspect}>` as well.

### Example `Preview.tsx`

```tsx
import type { TemplatePreviewProps } from '../types';
import { InspectBox } from '../../components/InspectBox';
import { MyTemplateShell, type ServiceItem } from './MyTemplateShell';

const MOCK_SERVICES: ServiceItem[] = [
  { id: 'api', name: 'Core API Gateway', region: 'us-east-1', uptime: '99.99%', status: 'operational' },
  { id: 'edge', name: 'Edge CDN PoPs', region: 'global', uptime: '99.98%', status: 'operational' },
  { id: 'worker', name: 'Async Job Queue', region: 'eu-central-1', uptime: '99.42%', status: 'degraded' },
  { id: 'db', name: 'Primary Postgres', region: 'us-east-1', uptime: '100.0%', status: 'operational' },
];

export default function Preview({ inspect = false }: TemplatePreviewProps) {
  return (
    <div data-inspect-mode={inspect ? 'true' : 'false'} className="min-h-full">
      <InspectBox label="MyTemplateShell" active={inspect}>
        <MyTemplateShell
          title="Platform System Status"
          subtitle="Real-time availability across production clusters."
          services={MOCK_SERVICES}
        />
      </InspectBox>
    </div>
  );
}
```

---

## 5. Auto-Discovery, `/r/<slug>.md`, & `/r/<slug>.design.md` Generation

No manual registration is required. `src/templates/registry.ts` uses Vite `import.meta.glob` at build/dev time:

- `./*/meta.ts` (eager) loads `meta` (including `meta.design`)
- `./*/Preview.tsx` (eager) loads the default React component
- `./*/**/*.ts` and `./*/**/*.tsx` (eager with `query: '?raw', import: 'default'`) load the raw source text of every `.ts` / `.tsx` file recursively, except the top-level `Preview.tsx` and `meta.ts`

For each matched `<slug>` that has both `meta.ts` and `Preview.tsx`:

1. Each deliverable file's `targetPath` is computed as `${meta.targetDir.replace(/\/+$/, '')}/${filename}`, where `filename` is the path relative to the template folder (e.g. `layout/Sidebar.tsx`).
2. `generateDesignGuideMarkdown(meta)` in `src/templates/design-guide.ts` builds the standalone `DESIGN.md` specification from `meta.design`.
3. `generateTemplateMarkdown(meta, files, customization?, options?)` in `src/templates/markdown.ts` builds the Markdown manifest containing metadata, the agent rules (Rules 1–3 plus Rule 4 when `designGuideTarget !== 'none'`), each file's `## File: \`<targetPath>\`` fenced `ts` (for `.ts`) or `tsx` (for `.tsx`) block, and an embedded `## File: \`DESIGN.md\`` (or `<targetDir>/DESIGN.md`) ```` ````markdown ```` block (`designGuideTarget` defaults to `'root'`, configurable to `'targetDir'` or `'none'`).
4. `src/pages/r/[slug].md.ts` prerenders `/r/<slug>.md` and `src/pages/r/[slug].design.md.ts` prerenders `/r/<slug>.design.md` (`export const prerender = true`, `Content-Type: text/markdown; charset=utf-8`).

In consumer projects, `DESIGN.md` acts as the persistent post-install design reference so subsequent pages, modals, and forms match the installed template.

---

## 6. Verification Checklist

After adding or updating a template, verify everything builds and serves cleanly:

1. **Type-check Astro and TypeScript:**
   ```bash
   pnpm check
   ```
   (Runs `astro check && tsc --noEmit` — confirm 0 errors.)

2. **Run unit & template contract tests:**
   ```bash
   pnpm test
   ```
   (Runs `tests/*.test.mjs`, including `validateDesignSchema(meta.design)`, swatch parity, `DESIGN.md` generation, standalone imports, and `data-inspect-label` checks.)

3. **Run the production static build:**
   ```bash
   pnpm build
   ```

4. **Confirm the generated Markdown manifest and Design Guide exist and exclude `Preview.tsx` and `meta.ts`:**
   - Check that `dist/r/<slug>.md` and `dist/r/<slug>.design.md` were generated.
   - Inspect `dist/r/<slug>.md` to verify it contains all intended deliverable `.ts` / `.tsx` files (including nested paths) under `## File: \`<targetDir>/<relative/path>.tsx\``, includes `## File: \`DESIGN.md\``, and does **not** include `Preview.tsx`, `meta.ts`, or any hub-internal imports (`InspectBox`, `../types`).

5. **Preview and curl locally:**
   ```bash
   pnpm preview
   ```
   In another terminal:
   ```bash
   curl -s http://localhost:4321/r/<slug>.md | head -n 40
   curl -s http://localhost:4321/r/<slug>.design.md | head -n 40
   ```
   Also open `http://localhost:4321` in the browser and test the new template across **Desktop**, **Tablet (768px)**, and **Mobile (390px)** viewports as well as **Inspect Templates** mode, **Customize** (`Theme Schema` presets), **Design Guide**, **Agent Raw**, and **1-Line Prompt**.
