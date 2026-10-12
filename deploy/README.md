# Four brands, one repository, four Cloudflare Workers

Each brand has its own **local ignored** `deploy/<brand>/.env`. Hidden filenames are
not a security boundary: real environment files must never be committed, even to a
private repository. Only `.env.example` templates are versioned.

Requires Node >=22.12, Python >=3.11 with venv support, and `npm ci`.
Release commands automatically create an isolated Python environment, install the
pinned audit dependencies, download Chromium into a project-local cache, and smoke-test
both runtimes. Deployment never invokes `sudo`, `su`, or a system package installer.
The runner image must provide Chromium's Linux shared libraries; the smoke test
stops publication if any are missing. Browser downloads do not require root.
`CHROMIUM_EXECUTABLE` may select an already provisioned browser.
`npm run cloudflare:prepare` runs preparation separately; it does not approve content.

| Brand | Local file | Build / Wrangler validation / deploy |
| --- | --- | --- |
| 3dyanimda | deploy/3dyanimda/.env | npm run build:3dyanimda / npm run check:3dyanimda / npm run deploy:3dyanimda |
| 3dsanayi | deploy/3dsanayi/.env | npm run build:3dsanayi / npm run check:3dsanayi / npm run deploy:3dsanayi |
| maketyanimda | deploy/maketyanimda/.env | npm run build:maketyanimda / npm run check:maketyanimda / npm run deploy:maketyanimda |
| parcayanimda | deploy/parcayanimda/.env | npm run build:parcayanimda / npm run check:parcayanimda / npm run deploy:parcayanimda |

## Local setup

Copy each brand's `.env.example` to `.env`. Set its Supabase public connection,
theme (`studio`, `industrial`, `editorial`), domain and Worker name. The four files
can use the same multi-tenant Supabase project, or separate compatible projects.
Each target project still needs this repository's migrations and tenant/domain mapping.
`VITE_TENANT_SLUG` and `VITE_TENANT_HOST` are derived from the selected brand and
SITE_DOMAIN; they cannot drift independently. RLS remains the authorization boundary.

Supply CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the ignored brand file or
CI environment; Wrangler login is also supported locally. Credentials are supplied
only to Wrangler. Only the allowlisted public Vite values enter browser assets.
Never put database passwords, service-role keys or Supabase management tokens in VITE_*.

A local file wins over the corresponding CI variables. Root Vite env files are
ignored for brand builds, inherited VITE_* values are cleared, and output is isolated
under `.cloudflare/<brand>/`. A brand mismatch from Supabase fails closed.

## What commands do

- `build:<brand>`: creates an isolated frontend build and preview Wrangler config.
  Does not deploy, run editorial approval, or claim SEO readiness.
- `check:<brand>`: builds, then runs **Wrangler deploy --dry-run**. No upload or DNS
  change. Confirms packaging/configuration, not account access or production readiness.
- `verify:<brand>`: prepares dependencies, runs the source/evidence-bound release
  gate, exports and audits all approved HTML, then runs Wrangler **--dry-run**.
  Does not upload or change DNS; no Cloudflare credentials are required.
- `deploy:<brand>`: prepares dependencies, runs the global content release gate, builds the selected brand,
  exports approved HTML/sitemap/robots from its public Supabase API, audits the
  actual HTML/content/identity/discovery files and Worker config, then deploys
  that brand's Worker. Failed checks stop before Cloudflare upload.

The 12 October 2026 source-bound AI review includes the latest brand assets and
performance changes. The fresh originality audit covers 796 authored content
records and four home asset records. Release preflight verifies the source snapshot
and every review evidence checksum; changed sources or evidence fail closed.
This is delegated AI review, not independent human sign-off.
See `docs/audits/release-delta-review-2026-10-12.json` for scope and limitations.

The `Cloudflare release packaging` GitHub Actions workflow independently runs
`verify:<brand>` for all four brands from a clean Linux checkout. Each successful
job validates 213 indexable pages and six noindex utility pages plus the actual
Wrangler bundle. Reports are retained as workflow artifacts. A dry-run does not
prove Cloudflare account authorization, custom-domain activation or live SEO.
Release checks remain active; no approval bypass was added.

The Worker serves exported HTML, true 404s and the admin/studio SPA shell. workers.dev
responses are noindex and their robots.txt disallows crawling. Preview artifacts
are always noindex. No fake demo URL is assigned by these scripts.

Set `WORKER_CUSTOM_DOMAIN=true` only when ready to attach SITE_DOMAIN in Cloudflare.
This adds that custom-domain route at deployment; false creates no domain route.
The zone must belong to the Cloudflare account. Register www aliases and redirect
policies separately if wanted. No domain has been attached by this implementation.

## Cloudflare Workers Builds from this same GitHub repository

Create four Worker projects connected to figtures/3dyanimda, each with root `/`:

1. Use a distinct Worker name matching WORKER_NAME (defaults are the brand slugs).
2. In each Worker's **Build variables/secrets**, supply its `.env.example` fields.
   Real ignored .env files are not present in a Git checkout. A runtime-only variable
   does not configure a Vite build. Store CLOUDFLARE_API_TOKEN as a build secret when
   external CI needs it; Cloudflare's own build deployment may provide credentials.
3. Build command: `npm run typecheck`. Deploy command: `npm run deploy:<brand>`.
   The deploy pipeline installs audit/browser dependencies, then builds and exports
   approved HTML. `.node-version` selects Node 22. No root password or extra env
   variable is needed for browser downloads. If the Chromium smoke test identifies
   missing shared libraries, use a runner image with those libraries or a provisioned
   browser via CHROMIUM_EXECUTABLE. Do not disable the smoke test or release checks.
4. Disable automatic non-production branch deploys until a separate staging setup
   has been configured. The supplied pipeline targets the named brand Worker.

No authenticated Cloudflare upload has succeeded. Deploy the brands sequentially
on runners with limited memory; a terminated parallel export was successfully
repeated alone. See the current deployment-readiness audit for actual outcomes.

Official references:
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
