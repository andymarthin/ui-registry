# AGENTS.md

Instructions for coding agents working in `ui-registry`.

## Stack & Verification Commands

- **Framework:** Astro (static output) + React 19 + Tailwind CSS v4 + TypeScript (strict)
- **Package Manager:** `pnpm`
- **Verification:**
  - `pnpm check` (`astro check && tsc --noEmit`)
  - `pnpm test` (`node --import ./tests/ts-loader.mjs --test tests/*.test.mjs`)
  - `pnpm build` (builds static `dist/` including `/r/<slug>.md` and `/r/<slug>.design.md` endpoints)
  - `pnpm preview` (serves `dist/` locally for smoke testing)

## Single-Source-of-Truth Architecture

- `src/templates/registry.ts` auto-discovers templates via `import.meta.glob`:
  - `./*/meta.ts` -> template metadata (`meta: TemplateMeta`, including required `design: TemplateDesignSchema`)
  - `./*/Preview.tsx` -> interactive preview component (`default` export)
  - `./*/**/*.ts` and `./*/**/*.tsx` (`?raw`, recursive, excluding top-level `Preview.tsx` and `meta.ts`) -> verbatim deliverable source files (subfolders like `layout/`, `widgets/`, `tables/` and helper/type `.ts` files included)
- `src/templates/design-schema.ts` defines `THEME_SCHEMES` (7 curated theme presets for Customize / `?scheme=<id>`), `resolveEffectiveDesignSchema`, and `validateDesignSchema`.
- `src/templates/design-guide.ts` generates each template's `DESIGN.md` reference (`generateDesignGuideMarkdown`, `resolveDesignGuidePath`) reflecting `meta.design` plus any active `THEME_SCHEMES` or token/copy overrides.
- `src/templates/markdown.ts` formats each template's metadata, rules (including Rule 4 for `DESIGN.md` when `designGuideTarget !== 'none'`), raw `.ts`/`.tsx` files (`ts` / `tsx` fences, nested relative paths preserved), and the embedded `DESIGN.md` specification (`4`-backtick `markdown` fence).
- `src/pages/r/[slug].md.ts` prerenders `/r/<slug>.md` and `src/pages/r/[slug].design.md.ts` prerenders `/r/<slug>.design.md` as `text/markdown; charset=utf-8` from the exact same `registry.ts` entries used by `src/components/HubApp.tsx`.

## Strict Standalone Rules for Template Authors

Deliverable `.ts` / `.tsx` files (recursively, including subfolders) inside `src/templates/<slug>/` are emitted verbatim to `/r/<slug>.md` for external projects (see [`docs/creating-templates.md`](docs/creating-templates.md) for the complete authoring guide and [`docs/adopting-from-live.md`](docs/adopting-from-live.md) when adopting a UI from a live website or app):

1. **Allowed imports only:** Deliverable `.ts` / `.tsx` files MUST ONLY import `react`, `lucide-react`, or relative (`./`, `../`) modules that resolve to other deliverable `.ts` / `.tsx` files strictly inside their own `src/templates/<slug>/` folder (subfolders allowed, e.g. `./layout/Sidebar`, `../types`). NEVER import the top-level `Preview.tsx`/`meta.ts`, escape the template folder, or import `../../components/InspectBox`, the hub's `../types`, or any hub-internal module.
2. **`Preview.tsx` / `meta.ts` exclusion:** Top-level `Preview.tsx` is for the Hub preview stage only and, like top-level `meta.ts`, is automatically excluded from `/r/<slug>.md`. `Preview.tsx` may import `../../components/InspectBox` and `../types`.
3. **Complete `meta.design` schema:** Every `meta.ts` must include `design: TemplateDesignSchema` passing `validateDesignSchema` with `design.palette.canvas` matching `swatchBg` and `design.palette.accent` matching `swatchAccent`, so `/r/<slug>.design.md` and the post-install `DESIGN.md` guide are accurate.
4. **Inspect mode support:** Annotate major layout sections in deliverable `.tsx` components with `data-inspect-label="<SectionName>"` so `src/styles/global.css` highlights them cleanly when Inspect Templates mode is active.
5. **Tailwind v4 utilities only:** Rely on Tailwind CSS v4 utility classes and inline props—do not require custom CSS edits in host apps.
6. **Props-driven data:** Accept typed props for all domain data and copy so consuming agents can wire real APIs without altering colors, typography, border radius, or layout geometry.

## Standard Artifact Templates

Use these templates so every spec, verification scorecard, run log, and PR stays consistent across agents:

- **Pull Requests:** [`.github/pull_request_template.md`](.github/pull_request_template.md) (Summary tree/diff, Before/After Evidence, Merge Danger Door/Blast Radius, Verification Checklist).
- **Obsidian Team Artifacts (`ui-lead` / `ui-checker`):**
  - Spec: `Projects/ui-template-team/templates/spec.md`
  - Run Log: `Projects/ui-template-team/templates/run-log.md`
  - Checker Scorecard: `Projects/ui-template-team/templates/checker-scorecard.md`
- **Template Authoring Guides:** [`docs/creating-templates.md`](docs/creating-templates.md) and [`docs/adopting-from-live.md`](docs/adopting-from-live.md).

## Git Commit Convention

- Never commit directly to `main`; always create a new feature branch (e.g. `feat/<slug>`, `fix/<slug>`).
- Make **small atomic commits grouped by logical layer** (e.g. core/schema, templates, hub UI, tests, docs).
- After verification (`pnpm check && pnpm test && pnpm build`) passes, automatically create the branch, commit, push to `origin`, and open a Pull Request targeting `main` (using [`.github/pull_request_template.md`](.github/pull_request_template.md)) without asking the user for commit permission (the PR is the review/merge gate).
- Never merge to `main`, force-push, or commit `node_modules/`, `dist/`, `.astro/`, or secrets.
