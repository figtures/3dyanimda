# Four brands, one repository, four Cloudflare Workers

Each brand has its own **local ignored** `deploy/<brand>/.env`. Hidden filenames are
not a security boundary: real environment files must never be committed, even to a
private repository. Only `.env.example` templates are versioned.

Requires Node >=22.12, `npm ci`, Python audit dependencies (Pillow, NumPy, SciPy),
and Playwright Chromium for the approved HTML export. `npx playwright install chromium`
installs the exporter browser. `CHROMIUM_EXECUTABLE` may specify an existing browser.

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
- `deploy:<brand>`: runs the global content release gate, builds the selected brand,
  exports approved HTML/sitemap/robots from its public Supabase API, audits the
  actual HTML/content/identity/discovery files and Worker config, then deploys
  that brand's Worker. Failed checks stop before Cloudflare upload.

The automatic originality audit passes for all 796 authored content routes and
four home asset records. On 8 October 2026, the owner delegated final approval to
Codex. The source-bound `content/release-review.json` certificate records an actual
AI review with `humanReviewPerformed: false`, and release preflight passes. Fresh
Supabase readback confirms 796 published records, zero drafts, 796 matching reviews,
and 28 registered assets (16 images and 12 models). See
`docs/audits/publication-applied-2026-10-08.json` for the committed database evidence.
All four approved exports pass: 852 index-eligible and 24 noindex utility HTML
pages. Four Wrangler packaging dry-runs pass against those artifacts. All four
real deploy commands stop before upload because `CLOUDFLARE_API_TOKEN` is absent.
Cloudflare account access is still unavailable. Canonical domains registered in
Supabase do not establish Cloudflare ownership or DNS activation. See
`docs/audits/IMPLEMENTATION-STATUS.md` for scope and limitations. The release checks
remain active; no approval bypass was added.

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
   The deploy pipeline includes the brand build and HTML export. Ensure audit Python
   dependencies and Playwright are installed in your build image; otherwise use a
   controlled CI runner with those prerequisites instead of bypassing checks.
4. Disable automatic non-production branch deploys until a separate staging setup
   has been configured. The supplied pipeline targets the named brand Worker.

No authenticated Cloudflare upload has succeeded. Deploy the brands sequentially
on runners with limited memory; a terminated parallel export was successfully
repeated alone. See the current deployment-readiness audit for actual outcomes.

Official references:
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
