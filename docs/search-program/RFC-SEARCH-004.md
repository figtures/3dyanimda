# RFC-SEARCH-004 — Stable hydration and mobile/public-host SEO validation

Date: 2026-10-12 (Europe/Istanbul). Status: owner-authorized implementation; no public-domain release certification.

## Findings and implementation

The previous export saved browser DOM and subsequently replaced the entire document body with a second React tree. This delayed LCP even when the same content had already been visible. The new export uses React's server renderer for stable text, Suspense and useId markers, then hydrateRoot attaches interactions to the existing nodes. Public route modules are prepared before hydration. Legacy exports and the private SPA retain their supported mount paths.

Only successful public landing-page query families, public tenant/settings/navigation/features cross the HTML boundary. Host, route, search, tenant and query-family guards reject mismatched snapshots. Admin/studio routes and mutation caches cannot use it. API authorization, writes and tenant RLS remain unchanged. Initial form values dependent on query parameters use the normal mount fallback when the exported search string differs.

Self-hosted fonts use optional display and expanded Latin/Turkish subsets including non-breaking spaces. Slow first visits can retain the system fallback font, avoiding a late font swap; subsequent cached visits can use the brand font. Versioned v2 files preserve immutable asset caching and original font licenses. FontTools/Brotli versions and the encoding audit are recorded.

The responsive hero preload follows the viewport meta, preventing speculative desktop-image selection on mobile. Module preloads created by the export-only React server renderer are removed from the serialized document; this export dependency is not a visitor requirement.

## Verification design

A short three-route diagnostic precedes the full four-brand, ten-route, two-device, three-repeat matrix. The real browser must preserve the original H1 node without hydration recovery, open/close the mobile menu, update quote-service selection and preserve a typed form value. No real form submission or email is part of the test.

The canonical-host lab maps the selected brand's hostname to a loopback-only HTTPS server inside Chrome. A temporary self-signed certificate is trusted only for this isolated test. It exercises the actual hostname-based robots/indexing code without changing production metadata or making a private preview public. Localhost/private-host exclusions have separate negative tests. These scores do not certify public DNS, public TLS, CDN behavior, production availability, indexing or CrUX. No noindex directive is manually stripped to produce a score.

## Rollback and limits

GitHub baseline: bdf3f9f26931eb354e4ebbcacafa5e90b579ef68. Previous owner-private Sites source: edf316b02771f1232a00901e2486182a78dd3e1b. Revert with a new source commit and rebuild; no database migration or destructive data change is involved. This is a rollback plan, not an executed recovery drill.

Full Notion program gates remain blocked until their independent production, evidence and review requirements are satisfied. Final observed scores belong in the dated measurement report, not this proposed-change record.
