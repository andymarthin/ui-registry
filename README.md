# UI Template Hub

Self-hosted static UI Template Hub built with **Astro**, **React**, and **Tailwind CSS v4**. It serves two audiences from a single source of truth:

1. **Interactive Browser Hub (`/`) & Full-Page Previews (`/preview/<slug>`)**: Filter templates by category, switch between **Desktop**, **Tablet (`768px`)**, and **Mobile (`390px`)** viewports, toggle **Inspect Templates** boundaries, open standalone full-page previews at `/preview/<slug>`, customize **Theme Schema** presets (`THEME_SCHEMES`) / tokens / copy, inspect the live **Design Guide**, view raw manifests, and generate 1-line coding-agent prompts.
2. **Raw Agent Manifests (`/r/<slug>.md`) & Design Guides (`/r/<slug>.design.md`)**: Prerendered static Markdown endpoints. `/r/<slug>.md` contains exact target paths, verbatim component source code, dependencies, strict copy/wiring rules, and an embedded `DESIGN.md` guide; `/r/<slug>.design.md` serves the standalone `DESIGN.md` design system specification directly.

## Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start local Astro dev server
pnpm test       # Run unit and template contract tests
pnpm build      # Build static output into dist/ (including /r/<slug>.md and /r/<slug>.design.md)
pnpm preview    # Preview the built static site locally
pnpm check      # Run astro check && tsc --noEmit
```

## Environment Variables

Copy the example environment file to set the default public Hub base URL used in the Base URL input and 1-Line Prompt generator:

```bash
cp .env.example .env
```

- `PUBLIC_HUB_URL`: Public origin for your hosted hub (for example, `https://ui.example.com`). When unset or empty, the app falls back to `window.location.origin` in the browser.
- `UI_HUB_TOKEN`: Optional build-time variable. When set, the Agent Prompt Builder shows the **Bearer Auth Header** toggle for private proxies. Only a boolean presence check runs at build time; the token value is never bundled into `dist/`.

## Deployment

`pnpm build` outputs a fully static site to `dist/` with no runtime server or database required. See [`docs/deploying.md`](docs/deploying.md) for deployment guides covering managed static hosts, Nginx/Caddy self-hosting, universal Docker containers, optional Bearer auth, and post-deploy smoke tests.

## Fetching a Template Manifest & `DESIGN.md`

Coding agents or terminal workflows can pull any template manifest or standalone design guide directly:

```bash
curl -s https://<your-hub-domain>/r/glass-portfolio.md
curl -s https://<your-hub-domain>/r/glass-portfolio.design.md -o DESIGN.md
```

### Customize Presets (`THEME_SCHEMES`) & Post-Install `DESIGN.md` Workflow

- **Customize (`Theme Schema`):** Pick one of the 7 built-in `THEME_SCHEMES` presets (`default`, `midnight-glass`, `swiss-brutalist`, `editorial-paper`, `phosphor-noc`, `soft-bento`, `enterprise-blue`) or fine-tune accent color, border radius, font family, density, and copy overrides. Changes live-sync across **Preview** (`?scheme=<id>` / token query params), **Design Guide**, **Agent Raw**, and **1-Line Prompt**.
- **Post-install `DESIGN.md` reference:** By default, `/r/<slug>.md` and the **1-Line Prompt** instruct the coding agent to write `DESIGN.md` to the project root (configurable in **1-Line Prompt** via **Design Guide (`DESIGN.md`)**: **Project Root**, **Target Dir** at `<targetDir>/DESIGN.md`, or **Skip**). Future pages, modals, forms, and components consult `DESIGN.md` so the entire app stays visually consistent with the installed template.

## Adding a New Template

`src/templates/registry.ts` uses Vite's `import.meta.glob` to auto-discover every template folder under `src/templates/<slug>/`—no manual registration list is required. See [`docs/creating-templates.md`](docs/creating-templates.md) for the full schema, examples, and verification checklist, or [`docs/adopting-from-live.md`](docs/adopting-from-live.md) for a step-by-step guide to adopting a template from a live website or app.

Create `src/templates/<slug>/` with:

1. `meta.ts` — exports `meta: TemplateMeta` (`slug`, `name`, `category`, `styleTag`, `styleFull`, swatch colors, `description`, `dependencies`, `targetDir`, `defaultInstruction`, and `design: TemplateDesignSchema`).
2. One or more standalone `.tsx` deliverable components — must import **only** `react`, `lucide-react`, or sibling `.tsx` files in the same template folder (never hub internals such as `InspectBox` or `../types`). Annotate major sections with `data-inspect-label="SectionName"`.
3. `Preview.tsx` — default-exports a React component accepting `{ inspect }: TemplatePreviewProps` that renders the deliverable components with realistic mock data (wrapped in `InspectBox` or `[data-inspect-mode]` as appropriate). `Preview.tsx` is excluded from `/r/<slug>.md`.

Once added, `pnpm build` automatically includes the template in the Hub UI and generates `dist/r/<slug>.md` and `dist/r/<slug>.design.md`.
