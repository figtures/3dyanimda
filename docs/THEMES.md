# Three public themes

The four brands share the same tenant-scoped content, routes, admin, SEO metadata,
customer Studio and quote engine. All three themes ship in the same application.
No database migration is required for this switch.

| Value | Design |
| --- | --- |
| `industrial` | Full-width photographic hero, petrol and lime, dark content headers, photographic service panels |
| `editorial` | Oversized typography, warm paper/orange, CAD → point cloud → solid illustration, horizontal service rows |
| `studio` | Cool gray/cobalt, service selector, real file entry on the homepage, technical content headers |

## Environment configuration

Copy `.env.example` to `.env.local`. The default is `studio`:

```dotenv
VITE_SITE_THEME=studio
```

Use a global selection alone for a consistent design across all brands, or override
individual brands within one shared build:

```dotenv
VITE_SITE_THEME=studio
VITE_THEME_3DYANIMDA=editorial
VITE_THEME_3DSANAYI=industrial
VITE_THEME_MAKETYANIMDA=editorial
VITE_THEME_PARCAYANIMDA=studio
```

Precedence: per-brand override → global selection → `studio` fallback. Blank
values inherit. Invalid names are ignored in favor of the next valid value.
Only these five public UI env values are used; they must not contain secrets.
The existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are unchanged.

**Vite reads env values at build time.** Restart `npm run dev` after changes. For
production, run `npm run build` and redeploy the resulting build; for the static
multi-domain release, rerun `npm run export:sites` after the build. Setting env on
an already built static server does not change its bundle. No DNS or content
changes are necessary to switch a theme.

## Local previews

Run `npm install` and `npm run dev`. The development-only toolbar offers all four
brands and all three themes. Direct links:

- `http://localhost:8080/?tenant=3dyanimda&theme=industrial`
- `http://localhost:8080/?tenant=3dyanimda&theme=editorial`
- `http://localhost:8080/?tenant=3dyanimda&theme=studio`

In development the query parameter takes priority over env. Remove `theme` from
the address when checking env defaults. Production ignores `?theme=` entirely;
it never changes tenant authorization, pricing or canonical URLs. There is no
public production theme picker.

## Scope and behavior

`BrandLayout` applies the selected theme to all public child routes: homepage,
service/solution/material/guide detail and listing pages, geographic content,
about, contact, legal, blog, portfolio and quote pages. Tenant content and enabled
features still determine which routes have published data. Admin and super-admin
are outside this theme boundary. The original database theme mixer does not select
these three layouts; env is authoritative for the new public designs.

- Studio's homepage entry validates type/20 MB limit, then carries the File and
  selected service in React Router history state to the existing quote Studio.
  It does not upload anything until the user submits the quote. In-app navigation
  preserves the file; users should reselect it after a fresh visit if the browser
  does not retain history state. Files are never stored in localStorage.
- The shared quote page retains STL preview, measurement, tenant material/pricing
  configuration, quantity, campaign handling and the technical request form.
- Editorial/Studio homepage models are generated locally with Three.js from an
  illustrative fixture. They are not a scan, production evidence or dimensional
  specification. Rendering is lazy-loaded, draws only on resize, releases GPU
  resources on unmount, and falls back to a local image without WebGL.
- Existing CMS hero title overrides win; brand-specific defaults remain intact.
  Industrial uses the configured hero image, with local brand artwork as fallback.
- Navigation, footer, detail layouts, listing grids, quote inputs and Studio
  adapt to mobile, tablet and desktop widths. Mobile navigation supports Escape.
  File selection works with keyboard, touch and drag/drop. Motion-reduction is
  respected; the homepage model has no continuous animation loop.
- Demo mode remains read-only and labels example prices. Real sending, pricing
  data, transactional mail and deployment require the new Supabase configuration.

## Verification

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:themes
npm run test:theme-env
npm run test:browser
```

For an existing Chrome binary, set `CHROMIUM_EXECUTABLE=/absolute/path/to/chromium`.
`test:themes` checks three themes × four brands × 320/390/768/1440 px homepage
widths, shared routes, every published seeded detail page, mobile menu, browser
exceptions, STL quantity pricing and homepage upload/service handoff. Screenshot
captures are in `docs/previews/themes/`. `test:browser` also covers invalid STL,
STEP behavior, regional prefill and unpublished geography. These tests use local
read-only demo data, not a live Supabase production project.

`test:theme-env` also compiles an isolated production build and verifies all three
selections, global fallback, per-brand override, ignored URL overrides and themed
quote navigation. It uses a mocked public API and does not alter `dist`.

Latest verification (2026-10-03): 13 unit tests, TypeScript, production build,
251 responsive route checks, four-brand STL/STEP/draft regression checks, and
production env selection passed. The inherited large-chunk build advisory remains.

## Sector-specific 3D showcase (October 3 refinement)

Nine original GLB models now power the hero examples and the interactive gallery.
Each brand has a three-model selection appropriate to its sector. The gallery
supports surface/wire/point views, pointer and keyboard rotation, zoom/reset and
GLB download. Models are illustrative; they are not manufacturing specifications.
Assets load only near the viewport. No continuous render loop runs, and GPU
resources are released when changing models or routes. Failed downloads / WebGL
context loss show a fallback with retry. The model source generator and ownership
notes are in `scripts/generate-showcase-models.mjs` and `public/models/README.md`.

Shared surfaces now use consistent rounded corners across all three themes,
including navigation controls, content cards, detail callouts and quote fields.
The quote engine, tenant isolation and env precedence are unchanged.
