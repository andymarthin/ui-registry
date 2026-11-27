# Adopting a Template from a Live Website or App

This guide walks human developers and AI coding agents through turning an existing live website or web application UI into a clean, standalone template in **UI Template Hub** (`src/templates/<slug>/`).

> **Reference:** For the complete `TemplateMeta` field table, component examples, and registry internals, see [`docs/creating-templates.md`](./creating-templates.md).

---

## 1. Scope & IP / Brand Hygiene

Adopt the **design system and structural craft**—never copy proprietary brand assets or real user data.

### What to adopt

- Layout geometry, grid/flex structure, column proportions, and spacing rhythm
- Visual hierarchy, surface layering, color palette, borders, shadows, and backdrop blur
- Typography scale, weights, tracking, and font-family pairing (`sans` / `serif` / `mono`)
- Border radii, badge/pill treatments, and elevation patterns
- Interactive UI patterns (navigation drawers, filter tabs, search bars, accordions, detail drawers, comparison toggles, modals)

### What to replace

- **Proprietary logos, wordmarks, and trademarks:** Replace with a neutral synthetic brand name and either a `lucide-react` icon or a minimal geometric inline SVG.
- **Copyrighted copy, photography, and custom illustrations:** Rewrite all headlines, labels, and descriptions for a clean fictional domain, and replace hosted brand imagery with CSS gradients, abstract SVG graphics, or data-driven UI visuals.
- **Real customer data or PII:** Replace names, emails, metrics, invoices, and logs with realistic synthetic mock data defined exclusively inside `Preview.tsx`.
- **Tracking scripts, third-party embeds, and host-specific assets:** Strip analytics tags, cookie banners, CDN font/script hacks, and references to private `/public` assets or external URLs that could break offline.

---

## 2. Step 1 — Audit & Capture the Live Reference

Before writing JSX, capture the reference across all three Hub viewport sizes so mobile and tablet adaptations are designed intentionally rather than bolted on later.

1. **Capture screenshots & inspect layout across 3 viewports:**
   - **Desktop (`1440px`)** — primary layout, multi-column grids, sidebars, and hover states
   - **Tablet (`768px`)** — collapsed column counts, medium breakpoints, and condensed navbars
   - **Mobile (`390px`)** — stacked sections, mobile nav drawers, scrollable tables, and headline wrapping
2. **Extract concrete design tokens via DevTools Computed Styles:**
   - **Surfaces & Backgrounds:** Page canvas hex (e.g., `#0A0A0B`), elevated card surface hex, subtle overlay fills (`bg-white/[0.03]`).
   - **Borders & Dividers:** Exact border hex or alpha (`border-white/10`, `border-zinc-800`).
   - **Accents & Status Colors:** Primary CTA fill/hover, focus rings, semantic success/warn/error tones.
   - **Typography:** Font stack roles (`font-sans`, `font-serif`, `font-mono`), display sizes, line-heights, letter-spacing (`tracking-tight`, `tracking-widest`), and `tabular-nums` for numeric metrics. *(The Hub preview shell loads `Inter`, `Instrument Serif`, and `JetBrains Mono`, while deliverable components should rely on standard Tailwind font utilities so they adapt cleanly in any host app.)*
   - **Radii & Elevation:** Corner radii (`rounded-lg`, `rounded-2xl`, `rounded-full`), shadows, rings, and `backdrop-blur-*` surfaces.
   - **Interactive States:** Document every interactive control to preserve—navigation drawers, filter pills, tabs, accordions, sortable/filterable lists, inspectable detail panels, and modals.
3. **Map sections to `data-inspect-label` landmarks:**
   - List each major visual section (for example: `TopNav`, `HeroSection`, `MetricGrid`, `ActivityTable`, `PricingGrid`, `Footer`) so you can annotate them with `data-inspect-label="<SectionName>"` in the deliverable components.
   - When **Inspect Templates** mode is toggled in the Hub or `/preview/<slug>`, `src/styles/global.css` automatically highlights `[data-inspect-mode="true"] [data-inspect-label]` with a dashed `#38bdf8` outline and floating top-left badge without altering layout geometry.

---

## 3. Step 2 — Decouple from the Live App's Stack

Live production apps are tightly coupled to frameworks, routers, state stores, and global stylesheets. Strip all of that out so the resulting template drops verbatim into any React + Tailwind CSS v4 codebase.

### Strip framework, router, and data dependencies

- Replace `next/link`, `next/image`, `react-router`, `@remix-run/*`, or Astro helpers with plain HTML `<a>`, `<img>`/`<svg>`, and `<button type="button">` elements.
- Replace Redux, Zustand, React Query, GraphQL, or `fetch()` calls with **typed props** (`export interface <Component>Props`) and optional callbacks (`onSelect`, `onNavigate`, `onSubmit`).
- Keep purely visual UI state (active tab, search filter, open accordion item, mobile menu drawer, selected detail row) inside local React `useState`.

### Convert styles to standalone Tailwind CSS v4 utilities

- Rewrite custom CSS files, CSS Modules, styled-components, Emotion, or Sass rules into inline **Tailwind CSS v4 utility classes** so consuming projects require **zero** global CSS edits.
- Use Tailwind arbitrary values where exact fidelity to the live reference matters (for example, `bg-[#0A0A0B]`, `border-white/[0.08]`, `shadow-[0_1px_0_rgba(255,255,255,0.06)]`).
- Avoid relying on custom `@theme` tokens or external stylesheets that a host repository will not have.

### Enforce the strict standalone import rule

Deliverable `.tsx` files are emitted **verbatim** into `/r/<slug>.md`:

- **Allowed imports ONLY:** `react`, `lucide-react` (or packages explicitly listed in `meta.dependencies`), and sibling `.tsx` files inside the same `src/templates/<slug>/` folder (e.g., `./MetricCard`).
- **Forbidden imports:** NEVER import `../../components/InspectBox`, `../types`, `../registry`, or any other Hub-internal module inside a deliverable `.tsx` file.

---

## 4. Step 3 — Scaffold in `src/templates/<slug>/`

Create a new lowercase kebab-case folder under `src/templates/<slug>/`:

```text
src/templates/<slug>/
├── meta.ts                 # Required: exports `meta: TemplateMeta`
├── Preview.tsx             # Required: Hub preview harness (excluded from /r/<slug>.md)
├── <MainShell>.tsx         # Required: standalone deliverable component
└── <SubComponent>.tsx      # Optional: additional sibling deliverable components
```

### How auto-discovery works (`src/templates/registry.ts`)

No manual registration is needed. At dev and build time, `src/templates/registry.ts` uses Vite `import.meta.glob` to discover every folder containing both `meta.ts` and `Preview.tsx`:

- `./*/meta.ts` loads `meta: TemplateMeta`.
- `./*/Preview.tsx` loads the default preview component rendered in `/` and `/preview/<slug>`.
- `./*/*.tsx` (`query: '?raw'`) collects direct-child `.tsx` files alphabetically as verbatim deliverables and **automatically excludes `Preview.tsx`**.
- `src/templates/markdown.ts` generates the Markdown manifest served at `/r/<slug>.md` (by `src/pages/r/[slug].md.ts`), and `src/pages/preview/[slug].astro` prerenders the standalone preview route `/preview/<slug>`.

### `meta.ts` checklist (`src/templates/types.ts`)

Fill every field of `TemplateMeta` accurately so both Hub users and downstream coding agents reproduce the adopted design faithfully:

- [ ] `slug`: Lowercase kebab-case slug matching the folder name (`src/templates/<slug>/`).
- [ ] `name`: Clear, domain-appropriate display title (no copied third-party brand names).
- [ ] `category`: One of the 5 allowed `TemplateCategory` values: `'Portfolio' | 'Web' | 'Analytics' | 'Infrastructure' | 'Logistics'`.
- [ ] `styleTag` & `styleFull`: Concise sidebar badge (e.g., `'Editorial Dark'`) and full aesthetic summary shown in the Hub header and `/r/<slug>.md` manifest.
- [ ] `swatchBg`, `swatchAccent`, `swatchBorder`: Exact hex colors extracted from the reference (`swatchBg` also sets the page background color on `/preview/<slug>`).
- [ ] `description`: 1–2 sentences describing the adopted layout structure, visual aesthetic, and interactive features.
- [ ] `dependencies`: Exact npm packages imported by deliverable `.tsx` files (typically `['lucide-react']`).
- [ ] `targetDir`: Default destination directory in consumer repos (e.g., `'src/components/<slug>'`), which sets every `## File: \`<targetDir>/<File>.tsx\`` header in `/r/<slug>.md`.
- [ ] `defaultInstruction`: Specific wiring instruction pre-filled in the **1-Line Prompt** tab telling downstream agents which props to connect to real APIs/copy while keeping colors, typography, radii, and layout geometry intact.

> **Design-preservation rules:** `src/templates/markdown.ts` automatically includes the `## Rules for Agent` section in every `/r/<slug>.md` manifest (write every file verbatim to its exact path, do not alter colors/typography/border radius/layout geometry, and wire real data or copy via props only).

### `Preview.tsx` checklist

- Accept `{ inspect = false }: TemplatePreviewProps` (importing `TemplatePreviewProps` from `../types` is allowed in `Preview.tsx`).
- Wrap the root element with `data-inspect-mode={inspect ? 'true' : 'false'}` so all `data-inspect-label` attributes in your deliverables highlight in Inspect Mode.
- Keep all synthetic mock data arrays and sample copy in `Preview.tsx` (passing them into deliverable components as props).

---

## 5. Step 4 — Mobile & Responsive Hardening Checklist

Live web apps are frequently desktop-first and break when narrowed to `390px`. Audit and fix these common overflow pitfalls before finalizing the template:

- [ ] **Prevent flex/grid blowouts (`min-w-0`):** Add `min-w-0` to flex and grid children—especially cards containing `<pre>`/`<code>` blocks, long URLs, email addresses, API keys, or monospace metrics—and pair with `truncate`, `break-all`, or `overflow-x-auto` as appropriate.
- [ ] **Contain wide tables (`overflow-x-auto`):** Wrap every multi-column `<table>` or horizontal data strip in `<div className="w-full overflow-x-auto">` (with a sensible `min-w-[...]` on the inner table if columns need minimum breathing room) so horizontal scrolling stays inside the table instead of widening the page.
- [ ] **Scale display headlines cleanly:** Use responsive type ramps (e.g., `text-3xl sm:text-5xl lg:text-6xl`) with `break-words` so large hero titles never clip or force horizontal scroll on `390px` screens.
- [ ] **Wrap dense toolbars and pill rows:** Add `flex-wrap` (or responsive `flex-col sm:flex-row`) on header action bars, filter tab groups, metadata badges, and CTA button rows.
- [ ] **Provide mobile navigation:** Convert fixed desktop sidebars or multi-link top headers into a working mobile drawer or collapsible menu (`lg:hidden` toggle button backed by `useState`) rather than letting links collide or overflow.
- [ ] **Verify all 3 viewports in both views:** Test **Desktop (`100%`)**, **Tablet (`768px`)**, and **Mobile (`390px`)** inside the Hub stage (`/`) **and** in the standalone full-page preview (`/preview/<slug>`), confirming zero unintended horizontal page scrollbars.

---

## 6. Step 5 — Verify & Ship

Run the full type-check and static build before committing:

```bash
ASTRO_TELEMETRY_DISABLED=1 pnpm check
ASTRO_TELEMETRY_DISABLED=1 pnpm build
```

Confirm zero TypeScript/Astro errors and then run these smoke checks:

1. **Check the generated manifest for hub-internal leaks:**
   Confirm `dist/r/<slug>.md` exists, contains every deliverable `.tsx` file under `## File: \`<targetDir>/<File>.tsx\``, and has **zero** references to `Preview.tsx`, `InspectBox`, `TemplateFullscreenPreview`, `../types`, or `../registry`:
   ```bash
   ls -la dist/r/<slug>.md
   grep -E "Preview\.tsx|InspectBox|TemplateFullscreenPreview|\.\./types|\.\./registry" dist/r/<slug>.md || echo "OK: no leaks"
   ```
2. **Smoke-test the built site locally:**
   ```bash
   pnpm preview
   ```
   Verify:
   - Hub `/` renders your template cleanly across **Desktop**, **Tablet (`768px`)**, and **Mobile (`390px`)** viewports.
   - **Inspect Templates** toggle highlights all `data-inspect-label` sections cleanly without shifting layout.
   - Standalone full-page route `http://localhost:4321/preview/<slug>` renders with the right background color and responsive behavior.
   - **Agent Raw** tab, **1-Line Prompt** tab, and `curl -s http://localhost:4321/r/<slug>.md | head -n 40` return the exact expected manifest.
3. **Commit atomically:**
   Follow `AGENTS.md`—make **1 small atomic commit** containing `src/templates/<slug>/*`, and never commit `node_modules/`, `dist/`, or `.astro/`.

---

## 7. Ready-to-Use Agent Prompt Template

Copy and paste the prompt below to an AI coding agent along with a live URL, screenshots (Desktop/Tablet/Mobile), or reference HTML/CSS snippet:

```markdown
Adopt the attached live website / UI reference into a new standalone template in `ui-registy` at `src/templates/<slug>/`.

Reference: <paste URL, screenshots for 1440px / 768px / 390px, or DOM/style notes>
Target category: <Portfolio | Web | Analytics | Infrastructure | Logistics>
Synthetic domain: <describe fictional brand/domain to replace proprietary copy and logos>

Requirements:
1. Follow `AGENTS.md`, `docs/creating-templates.md`, and `docs/adopting-from-live.md` strictly.
2. Preserve the reference's layout geometry, color palette, surface elevation, typography scale, border radii, and interactive patterns (tabs, filters, drawers, accordions, modals), but replace ALL proprietary branding, logos, copyrighted copy, photography, and real customer data with clean synthetic domain content.
3. Create `src/templates/<slug>/meta.ts` (`export const meta: TemplateMeta` matching `src/templates/types.ts`), one or more standalone deliverable `.tsx` components, and `src/templates/<slug>/Preview.tsx` (default export accepting `{ inspect = false }: TemplatePreviewProps` and wrapping its root with `data-inspect-mode={inspect ? 'true' : 'false'}`).
4. Deliverable `.tsx` rules:
   - Import ONLY `react`, `lucide-react`, or sibling `.tsx` files in `src/templates/<slug>/`. NEVER import `InspectBox`, `../types`, `../registry`, or any hub-internal module.
   - Use standalone Tailwind CSS v4 utility classes only (arbitrary values like `bg-[#...]` are encouraged for exact palette fidelity); require zero custom CSS edits in host apps.
   - Make all domain copy and data props-driven with exported TypeScript interfaces; keep purely visual UI state in local `useState`.
   - Annotate every major layout section with `data-inspect-label="<SectionName>"`.
5. Harden for Desktop (`1440px`), Tablet (`768px`), and Mobile (`390px`): use `min-w-0` on flex/grid children, `overflow-x-auto` around wide tables, responsive display headings with `break-words`, `flex-wrap` on action/pill rows, and a working mobile navigation drawer where applicable so there is zero horizontal overflow at `390px`.
6. Verify with:
   - `ASTRO_TELEMETRY_DISABLED=1 pnpm check`
   - `ASTRO_TELEMETRY_DISABLED=1 pnpm build`
   - Confirm `dist/r/<slug>.md` includes all deliverable `.tsx` files and contains zero occurrences of `Preview.tsx`, `InspectBox`, `TemplateFullscreenPreview`, or `../types`.
```
