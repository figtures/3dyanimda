# RFC-SEARCH-003 — Reproducible browser measurements and content correctness

Date: 2026-10-11. Status: owner-authorized implementation and private-preview preparation; no independent release approval.

## Concrete issues and changes

- Previous programmatic Lighthouse runner passed a CLI-only desktop preset in its flags; the raw configuration remained mobile. Import Lighthouse's desktop configuration explicitly and fail any run whose actual form factor differs from its label. Earlier desktop-labeled diagnostic samples are excluded from desktop conclusions.
- An export race allowed a cached CSS preload's onload callback to turn it back into a blocking stylesheet before HTML serialization. Mark deferred styles and normalize a detached document clone immediately before writing HTML. The real stylesheet fallback for JavaScript-disabled use remains present.
- Public navigation/translations were omitted from the existing anonymous bootstrap allowlist, causing redundant startup reads. Add only these anonymous public reads; authenticated sessions, writes, later navigation and other tenants remain excluded.
- Add responsive AVIF encodings for 12 existing service images at 640/1024 widths, retaining original WebP fallback and descriptive alternatives.
- The metadata helper discarded route-specific second sentences and generated duplicate descriptions on 13 regional pages. Retain the authored summaries; do not invent replacement content or enforce an arbitrary search-snippet cutoff.
- Darken the small desktop section description and regional-directory footnote after real contrast failures.
- Keep the complete prerender visible until route content has loaded; prevent the heading/query-idle race from revealing an incomplete directory and shifting the footer.
- Scope landing-page queries to the current kind and explicit related paths instead of downloading all 199 summaries on every route. Regression-test related-link parity across all 796 effective authored records.
- Add the optional typed answer-unit contract and structural schema integrity checks, with explicit missing-review status and negative fixtures. See ANSWER-UNIT-CONTRACT.md.

## Measurement scope

The GitHub Actions browser lab builds each brand from the recorded source commit, renders real anonymous public API content, and audits a gzipped localhost candidate with Chrome and Lighthouse 13.5.0. Ten routes per brand, mobile/desktop and three repetitions yield 240 intended final samples. Raw reports record actual form factor, throttling, screen settings and source/run identity. Completion and scores must come from the run results, not this intended matrix.

Local candidates retain noindex. No indexability protection is removed to inflate SEO scores; local noindex is expected and cannot certify production SEO. The measurements do not cover production DNS/TLS/CDN, field INP/CrUX, real social-platform previews, model visibility, email delivery or independent human approval.

## Risks, verification and rollback

Responsive encodings retain original source images; no branding redesign is introduced. CMS contracts are optional for existing records and do not fabricate or bulk-apply approvals. Read guards reject malformed URLs without crashing public content parsing. Existing authored content and database publication statuses are unchanged.

Unit/type/build, content inventory, negative fixtures and remote browser checks are recorded separately. Public-domain publication remains BLOCKED. Roll back the source changes with a new revert commit against GitHub baseline 09adfcac7cebee538414a7b863dd8ab30c50f63c, rebuild and publish to the same owner-private Sites audience. Previous Sites source is 047f4dbfd613686e51d33addaa6bc43de310c41e. A plan is not an executed RTO drill; actual restore verification remains outstanding.
