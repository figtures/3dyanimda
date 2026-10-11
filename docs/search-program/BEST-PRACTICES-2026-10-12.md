# Additional search and mobile checks — 12 October 2026

This extends the 20 Notion protocols; it does not replace their 123 controls or approve blocked release gates. Current measurements and unresolved items belong in the accompanying round-two audit.

| Area | Implemented or inspected | Remaining evidence |
| --- | --- | --- |
| Public availability | Independent CI DNS, HTTPS, robots, sitemap, llms and random-404 probes for all four canonical domains | The latest public probe reports ENOTFOUND; domain registration/delegation/records and public deployment must be investigated and public resolution restored before a production crawl |
| Mobile startup | Ready HTML is retained; route-scoped hydration includes theme, feature, navigation, metadata and redirect snapshots; duplicate startup requests removed | Final Lighthouse matrix and field data are separate; lab TBT is not INP |
| JavaScript | Public navigation uses native dialog and lightweight disclosure; backend SDK, form validation, editorial validation and translation initialization load only where needed | Keep admin authorization, translation-dependent routes, keyboard behavior and quote interaction tests passing |
| Fonts and layout | Latin/Turkish glyph coverage preserved; public font axes reduced to used 400–700 range; two primary Latin faces preloaded; below-fold region cards use content-visibility | Check production response/cache headers and all editorial scripts; unsupported glyphs use the system fallback |
| Transport | Candidate laboratory supports HTTP/2, gzip and TLS with an isolated canonical host | Public CDN/TLS and HTTP/2 must be verified separately. Earlier HTTP/1.1 lab scores are not directly comparable |
| Structured data | One connected, deterministic graph; actual Article/Service/FAQ/breadcrumb data; official vocabulary domain validation; all authored records plus public API inventory | Independent factual review, verified organization/logo data, supported rich-result checks and actual production render |
| Crawl/index controls | Exported HTML, canonical/OG parity, one H1, robots/sitemap and 404/redirect contracts; private preview keeps noindex | Live headers, response codes, canonical consolidation and Search Console/Bing inspection require working public domains |
| Content and GEO | Existing source notes, citations, dated substantive edits and visible answer units; no invented prices, reviews or branches | Repeated location pages require distinct useful local evidence and human review; do not mass-publish variations to meet an arbitrary count |
| AI discovery | Keep standard crawlable HTML and accurate structured data; llms.txt remains optional | Google does not require special AI markup or use llms.txt. Actual AI visibility requires a defined query set and recorded observations |
| Measurement | Raw Lighthouse JSON, settings, source SHA and run IDs retained; read-only production probe is separate | Verify Search Console/Bing ownership, 28-day CrUX/field data where available, conversion instrumentation and AI citation observations |

## Current official guidance beyond the original documents

- Google's AI optimization guide prioritizes original, useful, accessible content and standard search foundations. No special AI schema makes a site guaranteed to appear in AI responses. It also describes a Generative AI report in Search Console; availability and the property's actual data must be checked, not assumed. https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Structured data must represent visible and truthful content. Passing a parser does not prove eligibility or guarantee display. https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Organization identity and logo should be accurate and publicly crawlable; Google specifies a minimum logo size of 112×112. No unverifiable identity should be filled in simply to eliminate a warning. https://developers.google.com/search/docs/appearance/structured-data/organization
- Google stopped displaying FAQ rich results on 7 May 2026. Keep visible FAQ semantics where useful; remove promises of a FAQ rich-result benefit. https://developers.google.com/search/updates
- `content-visibility:auto` skips off-screen rendering work while keeping content in the DOM/accessibility tree. It is used only for later region cards, not to conceal text from readers or crawlers. https://web.dev/articles/content-visibility
- Cloudflare supports HTTP/2 over TLS. A local HTTP/2 lab is not proof of the domains' actual Cloudflare configuration. https://developers.cloudflare.com/speed/optimization/protocol/http2/

## Acceptance language

A Lighthouse SEO score of 100 means its automated checks passed for that tested document and environment. It is not 100% indexing, content quality, ranking, conversions or GEO coverage. A completed probe can have a successful CI job while reporting failed DNS; consumers must read the report status and errors. All missing external evidence stays visible and blocks the corresponding program gate.
