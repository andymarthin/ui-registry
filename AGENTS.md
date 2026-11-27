# AGENTS.md

Instructions for coding agents working in `ui-registry`.

## Stack & Verification Commands

- **Framework:** Astro (static output) + React 19 + Tailwind CSS v4 + TypeScript (strict)
- **Package Manager:** `pnpm`
- **Verification:**
  - `pnpm check` (`astro check && tsc --noEmit`)
  - `pnpm build` (builds static `dist/` including `/r/<slug>.md` endpoints)
  - `pnpm preview` (serves `dist/` locally for smoke testing)

## Single-Source-of-Truth Architecture

- `src/templates/registry.ts` auto-discovers templates via `import.meta.glob`:
  - `./*/meta.ts` -> template metadata (`meta: TemplateMeta`)
  - `./*/Preview.tsx` -> interactive preview component (`default` export)
  - `./*/**/*.ts` and `./*/**/*.tsx` (`?raw`, recursive, excluding top-level `Preview.tsx` and `meta.ts`) -> verbatim deliverable source files (subfolders like `layout/`, `widgets/`, `tables/` and helper/type `.ts` files included)
- `src/templates/markdown.ts` formats each template's metadata, rules, and raw `.ts`/`.tsx` files into Markdown (`ts` / `tsx` fences, nested relative paths preserved).
- `src/pages/r/[slug].md.ts` prerenders `/r/<slug>.md` as `text/markdown; charset=utf-8` from the exact same `registry.ts` entries used by `src/components/HubApp.tsx`.

## Strict Standalone Rules for Template Authors

Deliverable `.ts` / `.tsx` files (recursively, including subfolders) inside `src/templates/<slug>/` are emitted verbatim to `/r/<slug>.md` for external projects (see [`docs/creating-templates.md`](docs/creating-templates.md) for the complete authoring guide and [`docs/adopting-from-live.md`](docs/adopting-from-live.md) when adopting a UI from a live website or app):

1. **Allowed imports only:** Deliverable `.ts` / `.tsx` files MUST ONLY import `react`, `lucide-react`, or relative (`./`, `../`) modules that resolve to other deliverable `.ts` / `.tsx` files strictly inside their own `src/templates/<slug>/` folder (subfolders allowed, e.g. `./layout/Sidebar`, `../types`). NEVER import the top-level `Preview.tsx`/`meta.ts`, escape the template folder, or import `../../components/InspectBox`, the hub's `../types`, or any hub-internal module.
2. **`Preview.tsx` / `meta.ts` exclusion:** Top-level `Preview.tsx` is for the Hub preview stage only and, like top-level `meta.ts`, is automatically excluded from `/r/<slug>.md`. `Preview.tsx` may import `../../components/InspectBox` and `../types`.
3. **Inspect mode support:** Annotate major layout sections in deliverable `.tsx` components with `data-inspect-label="<SectionName>"` so `src/styles/global.css` highlights them cleanly when Inspect Templates mode is active.
4. **Tailwind v4 utilities only:** Rely on Tailwind CSS v4 utility classes and inline props—do not require custom CSS edits in host apps.
5. **Props-driven data:** Accept typed props for all domain data and copy so consuming agents can wire real APIs without altering colors, typography, border radius, or layout geometry.

## Git Commit Convention

- Make **1 small atomic commit per feature** (e.g. foundation, each template pair, hub shell, docs/polish).
- Never commit `node_modules/`, `dist/`, `.astro/`, or secrets.
