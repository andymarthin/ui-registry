# UI Template Hub

Self-hosted static UI Template Hub built with **Astro**, **React**, and **Tailwind CSS v4**. It serves two audiences from a single source of truth:

1. **Interactive Browser Hub (`/`) & Full-Page Previews (`/preview/<slug>`)**: Filter templates by category, switch between **Desktop**, **Tablet (`768px`)**, and **Mobile (`390px`)** viewports, toggle **Inspect Templates** boundaries, open standalone full-page previews at `/preview/<slug>`, view raw manifests, and generate 1-line coding-agent prompts.
2. **Raw Agent Manifests (`/r/<slug>.md`)**: Prerendered static Markdown files containing exact target paths, verbatim component source code, dependencies, and strict copy/wiring rules for coding agents.

## Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start local Astro dev server
pnpm build      # Build static output into dist/ (including /r/<slug>.md)
pnpm preview    # Preview the built static site locally
pnpm check      # Run astro check && tsc --noEmit
```

## Environment Variables

Copy the example environment file to set the default public Hub base URL used in the Base URL input and 1-Line Prompt generator:

```bash
cp .env.example .env
```

- `PUBLIC_HUB_URL`: Public origin for your hosted hub (for example, `https://ui.example.com`). When unset or empty, the app falls back to `window.location.origin` in the browser.

## Deployment

`pnpm build` outputs a fully static site to `dist/` with no runtime server or database required. See [`docs/deploying.md`](docs/deploying.md) for deployment guides covering managed static hosts, Nginx/Caddy self-hosting, universal Docker containers, optional Bearer auth, and post-deploy smoke tests.

## Fetching a Template Manifest

Coding agents or terminal workflows can pull any template manifest directly:

```bash
curl -s https://<your-hub-domain>/r/glass-portfolio.md
```

## Adding a New Template

`src/templates/registry.ts` uses Vite's `import.meta.glob` to auto-discover every template folder under `src/templates/<slug>/`—no manual registration list is required. See [`docs/creating-templates.md`](docs/creating-templates.md) for the full schema, examples, and verification checklist, or [`docs/adopting-from-live.md`](docs/adopting-from-live.md) for a step-by-step guide to adopting a template from a live website or app.

Create `src/templates/<slug>/` with:

1. `meta.ts` — exports `meta: TemplateMeta` (`slug`, `name`, `category`, `styleTag`, `styleFull`, swatch colors, `description`, `dependencies`, `targetDir`, and `defaultInstruction`).
2. One or more standalone `.tsx` deliverable components — must import **only** `react`, `lucide-react`, or sibling `.tsx` files in the same template folder (never hub internals such as `InspectBox` or `../types`). Annotate major sections with `data-inspect-label="SectionName"`.
3. `Preview.tsx` — default-exports a React component accepting `{ inspect }: TemplatePreviewProps` that renders the deliverable components with realistic mock data (wrapped in `InspectBox` or `[data-inspect-mode]` as appropriate). `Preview.tsx` is excluded from `/r/<slug>.md`.

Once added, `pnpm build` automatically includes the template in the Hub UI and generates `dist/r/<slug>.md`.
