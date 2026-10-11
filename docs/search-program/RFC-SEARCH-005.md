# RFC-SEARCH-005 — Lean public startup and connected JSON-LD

Date: 12 October 2026. Implementation authorized by the site owner in the conversation. This records implementation, not independent program/release approval.

## Problem and changes

The previous mobile matrix still had 89–98 performance medians. Public hydration repeatedly fetched already rendered theme, feature and metadata data, loaded the backend SDK and form validator on unrelated routes, and downloaded duplicate complete font faces. Large region grids performed avoidable off-screen layout work.

Public snapshots now include the initial theme, features, navigation, SEO override and redirect map. Fresh SPA renders still fetch current public data; static documents consume their route-specific snapshots. Explicit refresh, later uncached routes and backend actions still use the original Supabase client and tenant-bound access behavior. The SDK is dynamically imported; the public media URL helper does not initialize authentication. Form values are captured synchronously and validated before any upload or write, with busy/error handling around asynchronous loading. Translation-dependent components initialize their translation module when loaded.

Native modal dialog and a lightweight desktop disclosure replace general-purpose navigation overlays. The mobile dialog retains Escape, modal focus handling, close controls, inert background behavior, route-close and responsive-close behavior. Navigation was checked across four brands, three themes and four viewport widths; CI screenshots were inspected for mobile and desktop.

The font generator retains Latin/Turkish glyph coverage and limits variable weight axes to the 400–700 weights actually used. Four current font assets total 56,612 bytes versus 77,248 bytes in v2. Two Latin font faces are preloaded. Original assets and licenses remain available. Later region cards use content-visibility:auto without removing content from the DOM.

JSON-LD template 1.1.0 centralizes content source mapping and connects the primary page entity, breadcrumbs, FAQ, organization and website. Official vocabulary type/property-domain checks cover nested nodes and all effective authored records; a read-only CI inventory validates all published backend records independently. Exported HTML now fails closed on invalid graph structure/vocabulary. The contract and factual/external limitations are in SCHEMA-CONTRACT.md.

## Verification and measurement integrity

Local checks: 105 application tests, 46 Node tests, TypeScript and production build. External browser checks preserve the initial H1, detect hydration recovery, verify canonical/OG/visible FAQ parity, open/close navigation and retain quote-form state without submitting a request.

The lab now uses HTTP/2 TLS with HTTP/1.1 fallback and gzip, representing the intended Cloudflare transport. Previous results used HTTP/1.1. Their score differences cannot all be attributed to application changes. Canonical hostnames are mapped to loopback only inside CI Chrome and a local test certificate is trusted there. No public DNS/TLS, production indexing or field performance is asserted. Default final coverage remains four brands × ten routes × two devices × three repetitions.

Source-transfer and audit-runner errors in preliminary CI attempts were corrected; failed attempts remain visible in GitHub and are not counted as measurement evidence. Before the accepted diagnostic run, all 62 transferred text files were verified against Git blob hashes and four binary font blobs were preserved.

## Rollback and remaining gates

Previous private Sites source: 23b1fe171ab67eabf9cd6324c67ad382e2d0353f. Previous validated application source in GitHub: b24be0e57ba9fe86f01098ae14c28f6f976a9f29. Revert the relevant source change with a new commit and rebuild; no destructive database operation or schema migration occurred. No rollback drill was performed.

The public-domain probe reports ENOTFOUND for all four canonical domains from GitHub's external runner. Domain registration/delegation/records, public TLS/deployment, production HTML crawl, search-console evidence, real-user metrics, content/claim-source review and measured GEO observations remain open. Those gates retain BLOCKED/NO-GO status.

## Focused interaction recheck

In the first full matrix, the 3dsanayi mobile quote interaction asserted immediately after a click and failed its state check. The harness now waits up to five seconds for the requested React selection to be committed, then checks the typed value and native form validity. It still fails if the selection never appears. No application behavior, measurement settings or performance threshold changed. The first four pages retain their original 12 measurements; the quote page and remaining five pages are measured in the focused follow-up, with all source/run provenance retained. Preliminary failed quote samples are not promoted to accepted evidence.
