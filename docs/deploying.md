# Deploying UI Template Hub

This guide covers building, configuring, and deploying **UI Template Hub** (`ui-registry`) to any static host, web server, or container platform.

---

## 1. Architecture & Build Output

`astro.config.mjs` is configured with `output: 'static'`. Running `pnpm build` compiles the entire Hub and every template manifest into plain static files under `dist/`:

```text
dist/
├── index.html                      # Interactive browser Hub (/)
├── _astro/                         # Content-hashed JS and CSS bundles
├── preview/
│   └── <slug>/
│       └── index.html              # Standalone full-page template previews (/preview/<slug>)
└── r/
    └── <slug>.md                   # Prerendered raw Markdown manifests (/r/<slug>.md)
```

Because every HTML page, asset bundle, and `/r/<slug>.md` manifest is prerendered at build time:

- **No runtime Node.js server is required** in production.
- **No database or external backend is required.**
- Any static CDN, object storage + edge router, reverse proxy, or lightweight container serving `dist/` works out of the box.

---

## 2. Configuration (`PUBLIC_HUB_URL`)

**No `.env` file is required to build or deploy.** The Hub supports a single optional build-time environment variable (documented in [`.env.example`](../.env.example)):

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PUBLIC_HUB_URL` | No | `https://ui.example.com` | Optional canonical origin pre-filled in the Hub Base URL bar and the **1-Line Prompt** generator |

### How it behaves

- **Automatic host detection by default:** When `PUBLIC_HUB_URL` is omitted, commented out, or empty, the Hub automatically detects the current host (`window.location.origin`) at runtime in the browser. A single static build or container image works across local preview, staging, and production domains without creating a `.env` file or rebuilding.
- **Optional canonical domain pin:** You only need to uncomment/set `PUBLIC_HUB_URL` (in `.env` or your CI/host environment settings before `pnpm build`) if you want to pin a specific canonical origin into the client bundle (trailing slashes are stripped automatically).
- **Runtime override in the UI:** Operators can always edit the Base URL input directly in the Hub UI to generate prompts for any target origin.

```bash
# Optional — only needed if pinning a canonical domain instead of auto-detecting window.location.origin
cp .env.example .env
# Uncomment PUBLIC_HUB_URL=https://ui.example.com in .env
```

---

## 3. Build & Local Verification

Requires **Node.js 22.23+ (recommended: 24 LTS)** and **pnpm**.

```bash
# 1. Install exact lockfile dependencies
pnpm install --frozen-lockfile

# 2. Type-check Astro pages and TypeScript modules
pnpm check

# 3. Build static output into dist/
pnpm build

# 4. Serve dist/ locally (defaults to http://localhost:4321)
pnpm preview
```

While `pnpm preview` is running, verify that a prerendered manifest responds with `200 OK` and Markdown content:

```bash
curl -i http://localhost:4321/r/glass-portfolio.md | head -n 20
```

You should see `HTTP/1.1 200 OK`, `content-type: text/markdown; charset=utf-8` (or `text/markdown`), and the template's `# Liquid Glass Portfolio` Markdown header.

---

## 4. Deploying to Managed Static Hosts

Every major static host can build directly from the repository with the same core settings:

| Platform | Build Command | Output Directory | Node Version | Environment Variables |
| --- | --- | --- | --- | --- |
| **Cloudflare Pages** | `pnpm build` | `dist` | `22.23+` (rec. `24`, `NODE_VERSION=24`) | `PUBLIC_HUB_URL` (optional) |
| **Vercel** | `pnpm build` | `dist` | `22.23+` (rec. `24.x`) | `PUBLIC_HUB_URL` (optional) |
| **Netlify** | `pnpm build` | `dist` | `22.23+` (rec. `24`, `NODE_VERSION=24`) | `PUBLIC_HUB_URL` (optional) |
| **GitHub Pages** | `pnpm build` | `dist` | `22.23+` (rec. `24`, `actions/setup-node`) | `ASTRO_SITE`, `ASTRO_BASE`, `PUBLIC_HUB_URL` (optional) |

### Platform Notes

- **GitHub Pages (including subpath deployments):** Subpath deployments (such as `https://<user>.github.io/<repo>/`) are supported automatically via `ASTRO_SITE` and `ASTRO_BASE`. See [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) for the ready-to-use GitHub Actions workflow that wires `actions/configure-pages` outputs into `ASTRO_SITE` and `ASTRO_BASE` and deploys `dist/` with `actions/deploy-pages`.
- **Markdown `Content-Type` header:** Most static hosts serve `.md` files as `text/markdown` automatically. If a host serves `.md` as `application/octet-stream`, add a response header rule for `/r/*.md` setting `Content-Type: text/markdown; charset=utf-8` (for example, `public/_headers` on Cloudflare Pages/Netlify or a `headers` rule in `vercel.json`).

---

## 5. Self-Hosting with Any Web Server (Nginx & Caddy)

Copy the built `dist/` directory to your server (for example, `/var/www/ui-hub/dist`) and serve it with Nginx or Caddy.

### Nginx

```nginx
server {
    listen 80;
    server_name ui.example.com;

    root /var/www/ui-hub/dist;
    index index.html;

    # Content-hashed Astro assets can be cached aggressively
    location ^~ /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # Prerendered raw Markdown manifests for coding agents
    location ^~ /r/ {
        types {
            text/markdown md;
        }
        default_type text/markdown;
        charset utf-8;
        charset_types text/markdown;
        add_header Cache-Control "public, max-age=60, must-revalidate";
        try_files $uri =404;
    }

    # Root Hub (/) and full-page previews (/preview/<slug>/index.html)
    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ =404;
    }
}
```

For HTTPS with Nginx, terminate TLS at an upstream load balancer/CDN or add a `listen 443 ssl http2;` block with certificates from Let's Encrypt (for example, via `certbot --nginx -d ui.example.com`).

### Caddy

Caddy automatically provisions and renews HTTPS certificates when configured with a public domain name:

```caddyfile
ui.example.com {
    root * /var/www/ui-hub/dist
    encode zstd gzip

    @assets path /_astro/*
    header @assets Cache-Control "public, max-age=31536000, immutable"

    @manifests path /r/*.md
    header @manifests {
        Content-Type "text/markdown; charset=utf-8"
        Cache-Control "public, max-age=60, must-revalidate"
    }

    @html not path /_astro/* /r/*
    header @html Cache-Control "no-cache"

    file_server
}
```

> **Behind an upstream TLS proxy?** Replace `ui.example.com` with `:80` (or `http://ui.example.com`) so Caddy listens over plain HTTP internally.

---

## 6. Container Deployment (Universal Docker)

A minimal multi-stage `Dockerfile` builds `dist/` with Node 24 LTS + pnpm and serves it with `nginx:alpine`. The resulting image is stateless, tiny, and deploys identically on any VPS, Kubernetes cluster, Fly.io, Railway, Coolify, or Dokploy.

Create a `nginx.conf` for the container:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location ^~ /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location ^~ /r/ {
        types {
            text/markdown md;
        }
        default_type text/markdown;
        charset utf-8;
        charset_types text/markdown;
        add_header Cache-Control "public, max-age=60, must-revalidate";
        try_files $uri =404;
    }

    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ =404;
    }
}
```

Create the multi-stage `Dockerfile`:

```dockerfile
# Stage 1: Build static Astro output
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Optional: bake a default PUBLIC_HUB_URL, or leave empty to use window.location.origin
ARG PUBLIC_HUB_URL=""
ENV PUBLIC_HUB_URL=${PUBLIC_HUB_URL}

RUN pnpm build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run locally or push to any container registry:

```bash
# Build (omit --build-arg to rely on window.location.origin at runtime)
docker build \
  --build-arg PUBLIC_HUB_URL=https://ui.example.com \
  -t ui-hub:latest .

# Run on http://localhost:8080
docker run --rm -p 8080:80 ui-hub:latest
```

---

## 7. Optional Private Registry Auth

Because UI Template Hub is purely static, access control belongs at your reverse proxy, CDN, or edge gateway.

The Hub's **1-Line Prompt** panel includes a **Bearer Auth Header** toggle that automatically injects:

```bash
-H "Authorization: Bearer $UI_HUB_TOKEN"
```

into the generated `curl` command so coding agents authenticate without embedding raw secrets in prompts.

> The toggle is only displayed when `UI_HUB_TOKEN` is configured in the build environment. It is evaluated as a boolean presence check at build time; the token value is never bundled into `dist/`.

### Protecting `/r/*.md` at the Reverse Proxy

Always enforce HTTPS before enabling Bearer tokens so credentials are never transmitted in plaintext. Keep tokens out of client-side code and version control.

#### Nginx example

Validate the `Authorization` header on `/r/` (or move the check to `location /` to protect the entire Hub):

```nginx
location ^~ /r/ {
    if ($http_authorization != "Bearer REPLACE_WITH_STRONG_TOKEN") {
        return 401 "Unauthorized\n";
    }

    types {
        text/markdown md;
    }
    default_type text/markdown;
    charset utf-8;
    charset_types text/markdown;
    add_header Cache-Control "private, no-store";
    try_files $uri =404;
}
```

#### Caddy example

Load the token from an environment variable (for example, `UI_HUB_TOKEN` in your service unit or container env):

```caddyfile
@manifests path /r/*.md
handle @manifests {
    @unauthorized not header Authorization "Bearer {$UI_HUB_TOKEN}"
    respond @unauthorized "Unauthorized" 401

    header {
        Content-Type "text/markdown; charset=utf-8"
        Cache-Control "private, no-store"
    }
    file_server
}
```

### Pairing with Coding Agents

1. Export the shared token in the developer's or agent's shell environment:
   ```bash
   export UI_HUB_TOKEN="your-secret-token"
   ```
2. In the Hub UI, open the **1-Line Prompt** panel and enable **Bearer Auth Header**.
3. Copy the generated prompt—the agent will fetch manifests using `curl -s -H "Authorization: Bearer $UI_HUB_TOKEN" https://ui.example.com/r/<slug>.md`.

---

## 8. Post-Deploy Smoke Test Checklist

Replace `https://ui.example.com` with your deployed origin and verify each item:

- [ ] **Hub root (`/`):** Open `https://ui.example.com/` in a browser. Confirm the sidebar lists all templates, category filters work, and Desktop / Tablet / Mobile viewport switching renders without console errors.
- [ ] **Standalone preview (`/preview/<slug>`):** Open `https://ui.example.com/preview/glass-portfolio` directly (and via the Hub's full-page preview link). Confirm the page loads with styles intact and **Inspect Templates** highlights sections in the embedded preview.
- [ ] **Raw Markdown manifest (`/r/<slug>.md`):** Verify status code, `Content-Type`, and body:
  ```bash
  curl -i https://ui.example.com/r/glass-portfolio.md | head -n 25
  ```
  Expect `HTTP/2 200` (or `HTTP/1.1 200`), `content-type: text/markdown; charset=utf-8`, and the template's Markdown title, metadata, and fenced `.tsx` source blocks.
- [ ] **Generated 1-Line Prompt:** In the Hub UI, open **1-Line Prompt**, confirm the Base URL matches your deployed domain, copy the prompt, and run the embedded `curl` command from a terminal to confirm it returns the full manifest.
- [ ] **Optional Bearer Auth (if enabled):** Confirm an unauthenticated request to `/r/glass-portfolio.md` returns `401 Unauthorized` and a request with `-H "Authorization: Bearer $UI_HUB_TOKEN"` returns `200 OK`.
