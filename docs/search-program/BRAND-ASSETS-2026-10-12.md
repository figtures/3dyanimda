# Brand assets — 12 October 2026

Scope: the four existing brands and their existing owner-private preview. This change is not a public release approval.

## Source and selection

The latest sources were recovered from the owner's “SVG logo tasarımı” conversation. 3dyanimda, maketyanimda and parcayanimda use the supplied outlined SVGs. Their actual paths and lettering are preserved, with symbol-only, lettering-only, horizontal and white-on-dark variants.

3dsanayi uses the latest black-and-white 3S concept (12 October 2026, 00:02 UTC). The conversation still requested further work on this brand and contains no final approval of that concept. Its monochrome contours were traced from the supplied PNG; the horizontal lockup arranges the same symbol and lettering. It is explicitly marked as provisional in the admin. Source provenance is in `assets/brand-sources/provenance.json`.

## Implementation

80 web assets: outlined SVG logos, transparent PNG exports, SVG/ICO favicons, PNG icons at 16/32/48/96/180/192/512, 1200×630 PNG social cards and 512×512 organization logos. The generator is `scripts/create-brand-assets.mjs`; the complete checksummed manifest is `docs/audits/brand-assets-2026-10-12.json`. The compact runtime manifest carries only the ten managed fields per brand.

Admin → Marka görselleri (`/admin/settings`) manages ten independent `site_settings` keys per tenant: `logo_wordmark`, `logo_wordmark_light`, `logo_icon`, `logo_icon_light`, `logo_text`, `logo_text_light`, `favicon`, `apple_touch_icon`, `og_image`, `organization_logo`. Database changes require `settings.edit`; uploads additionally require `media.upload`. Uploaded objects use `<tenant-id>/branding/<slot>-<uuid>.<ext>` in the existing public `site-assets` bucket. No database schema or access policy change is required.

Uploads preserve validated SVG paths rather than rasterizing/cropping. Active SVG, external resources, wrong dimensions and files larger than 2 MB are rejected. Storage errors do not save settings; failed DB writes clean up only the new object. Reset switches the DB value back to the shipped default and retains previous objects, which may still be used on another page. Public asset URLs cannot contain credentials or expiring query strings.

The active theme selects the header logo; the footer uses the white variant. Explicit logo boxes avoid layout shift. Favicon and Apple icon links follow the selected brand. Social priority is page-specific SEO image → brand setting → bundled default. The Organization JSON-LD logo uses the same managed identity configuration, independent of verified contact/address facts.

Initial bundled URLs are relative to each site's origin and are served with the site. Upload replacements are public Supabase Storage URLs. There is no dependency on a private preview URL or signed asset URL. Rebuilding/publishing the public HTML export is required after a CMS asset change so non-JavaScript crawlers and social scrapers see it. External scraper caches can lag deployment.

## Verification and remaining gates

Local TypeScript check, 126 Vitest tests and 46 Node contract tests pass. New checks cover source vectors, unsafe SVG/URL rejection, image dimensions, defaults and overrides, original SVG uploads, upload/DB failure cleanup, brand-switch protection and resetting without deleting shared objects. The navigation CI additionally verifies logos, favicon, Apple icon and OG metadata across all four brands, three themes and four viewports (320/390/768/1440).

Existing restrictive `Images brand boundary` and `Require selected brand` RLS policies were read back from the live project and are RESTRICTIVE. Existing settings and media permission policies remain in effect. No authenticated production UI session was available; upload behavior is covered with mocked Storage/DB clients plus inspection of live authorization policies, not an owner-authenticated end-to-end upload claim.

Public readiness remains blocked: the last public DNS probe could not resolve the four canonical domains. Public TLS, crawler fetchability, real social preview debuggers, Search Console/Bing checks, field Core Web Vitals and measured GEO visibility remain unverified. Logo assets do not close those release gates or guarantee ranking, indexing or AI citations.

## Rollback

Restore the previous source version and restore only the ten managed settings per brand from the pre-change snapshot. Before this change those keys were absent. Do not alter unrelated `verified_business_identity`, content or page-specific SEO records. Retain uploaded files until their references have been reviewed.

## References

- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/security/access-control

### Completed CI evidence

Source `82bf78868ddf5f3f0a9d1bc2b793fe83f6dbece7`:

- https://github.com/figtures/3dyanimda/actions/runs/38187820071 — all four jobs pass; 48 navigation/branding cases and 796 public API schema records pass. The DNS evidence job successfully records `ENOTFOUND` for all four domains; job success is not a domain-health pass.
- https://github.com/figtures/3dyanimda/actions/runs/38187820070 — three focused mobile Lighthouse runs on 3dyanimda: home performance 99, regions 100, quote 100; SEO/accessibility/best practices 100 for all three; CLS 0; LCP 1.51–1.66 seconds. These are single-run candidate-lab diagnostics, not public production measurements or a fresh full-site 240-run audit.
- Browser screenshots were inspected for all four mobile headers; logos are legible and navigation controls fit. All 80 generated files match their recorded SHA-256 hashes; PNG dimensions were read from the actual files.

Detailed current evidence: `docs/audits/brand-refresh-validation-2026-10-12.json`. Initialization SQL: `supabase/seeds/brand-assets.sql` (idempotent; preserves existing settings).
