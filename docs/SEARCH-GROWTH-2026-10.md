# Search, AI discovery and quote conversion — 6 October 2026

## Scope and release state

This upgrade extends the recovered `figtures/3dyanimda` codebase at `d6bb46261f7cfe9a08fed10eb0fe6ff032de0004`, which already derives from the original 3D Yanında source snapshot. The existing tenant isolation, admin editor, quote workflow, static HTML exporter and publication review gates remain in place.

The implementation is ready for the private design demo. It has **not** been deployed to the four public domains. The new database migration has been tested locally but not applied to the remote Supabase project. No Search Console, Bing or IndexNow submission has been made. GA4 collection is inactive until a brand measurement ID is configured and a visitor grants analytics consent.

Cloning source preserves reusable implementation; it does not transfer the original domain's backlinks, reputation, indexed history or search performance. No ranking, indexing deadline or sales outcome is promised.

## Implemented

| Area | Behavior |
| --- | --- |
| Canonical URLs | Strip query/fragment and trailing/index variants from canonical metadata; production Worker consolidates HTTPS, www and known legacy service aliases. Brand origins remain separate. |
| Search presentation | Restore large image, unrestricted snippet and video preview directives on eligible pages; brand-specific titles, Open Graph, Twitter and actual content modification dates. |
| Structured data | Linked Organization, WebSite and WebPage graph; Article for guides, Service for services, matching visible FAQ and breadcrumbs, ItemList for content hubs. Business address and ProfessionalService come from verified identity settings. |
| Content | Enrich 12 service pages and add 8 buyer guides with direct answers, project decision criteria, comparison tables, FAQs and relevant service links. The format supports readers; it is not an AI inclusion requirement. |
| Quote conversion | Page subject and selected service carry into the quote form. Related content and contextual calls to action connect research to a technical request. |
| Discovery | Export a sitemap index and segmented child sitemaps from rendered, published canonical pages; include actual modification dates only when known and same-origin image references. The optional llms.txt is a directory, not a ranking mechanism. |
| Change notifications | Compare content fingerprints against the previous manifest. After deployment, verify the live ownership key, response status, robots directives and canonical URL before sending new/changed/removed URLs to IndexNow. |
| Measurement | Consent-dependent GA4 events: page_view, quote_cta_click, quote_start, quote_submit_error, generate_lead and contact_click. Recognize Google/Bing and known AI referral channels. Application events omit form values, filenames and query parameters. |
| Editor | Validated optional editorial JSON stores answers, takeaways, comparison tables, related paths and sources. Legacy rows remain readable. |
| Migration | `20261006150000_search_editorial.sql` adds editorial data, updates only untouched draft service bodies, inserts guide drafts and preserves previously edited or published rows. Existing certificate hashes include editorial changes. |

## Eight new guides

| Brand | Guide routes |
| --- | --- |
| 3dyanimda | `/rehber/prototip-maliyetini-ne-belirler`, `/rehber/3d-baski-mi-cnc-mi` |
| 3dsanayi | `/rehber/fikstur-numune-kabul-plani`, `/rehber/aparat-malzeme-secimi` |
| maketyanimda | `/rehber/mimari-maket-olcek-secimi`, `/rehber/maket-fiyati-teklif-kapsami` |
| parcayanimda | `/rehber/kirik-parca-yeniden-uretim`, `/rehber/otomotiv-plastik-parca-malzeme` |

The demo merges `src/content/search-pages.json` over the existing demo inventory. Production continues to read the database and its publication status; the local demo's published flags do not authorize database publication. Regenerate the overlay and migration with `npm run content:search`.

## Validation and remaining content work

- TypeScript check passed; 26 application tests and 8 discovery/deployment tests passed.
- PostgreSQL/PGlite migration regression passed: new guide drafts, preserved owner edit, tenant access rules, editorial object constraint and unchanged publication gate behavior.
- Browser QA passed 24 combinations of brand, theme and viewport, plus four service-to-quote transfers. Canonicals, preview noindex, Article/FAQ/website data, tables, headings and viewport overflow were checked. Desktop and mobile screenshots were inspected.
- The full content audit still fails: 148 audited records including homepages, 87 repeated-paragraph groups, 522 near-duplicate pairs and 3 reused-asset groups in the inherited inventory. Counts refer to findings, not distinct affected pages. The release remains blocked.
- The new 20-record cohort, with four automatically included homepage records, has no detected text duplication. That cohort audit still fails on the inherited homepage image shared by 3dyanimda and 3dsanayi. No audit or human-review certificate has been fabricated.
- Vite emits existing large-chunk warnings. Browser function checks are not Core Web Vitals measurements; field performance remains to be measured on a real deployment.

## Production rollout, in order

1. Resolve duplicate content and reused asset findings in the publication inventory, complete semantic/provenance review and obtain the existing release certificate. Use real specifications, approved sample reports and customer evidence where available. Do not invent test data, locations, testimonials or manufacturer certification.
2. Apply the new draft-only migration to the existing Supabase project through its authorized deployment environment. Review the new records before publication. No browser editor may self-issue certificates.
3. Configure each `deploy/<brand>/.env` from the documented brand setup. Existing Supabase public settings and Cloudflare credentials are required. New optional settings are `VITE_GA4_MEASUREMENT_ID`, `VITE_GOOGLE_SITE_VERIFICATION`, `VITE_BING_SITE_VERIFICATION`, and server-side `INDEXNOW_KEY`. Keep credentials out of source and chat.
4. Run each brand's approved export/deploy command. This preserves tenant isolation, validates real rendered HTML, writes discovery artifacts and optionally performs verified post-deployment IndexNow notifications. The www hostname must also be routed to the Worker before its redirect can operate.
5. Verify domain ownership in Search Console and Bing Webmaster Tools, submit the sitemap index and inspect priority canonical URLs. In Search Console, check inclusion in Search generative AI features and its Generative AI performance report. Allow legitimate OAI-SearchBot requests through robots and edge rules; its search control is independent of GPTBot training control.
6. Check live HTML, HTTP status, canonicals, robots, structured data, mobile rendering, quote receipt and real field performance. Establish a baseline before comparing periods.

IndexNow acknowledges a notification, not guaranteed indexing. Google discovery uses the sitemap, internal links and Search Console; this implementation does not treat IndexNow as a Google submission service.

## Measurement decisions

Use separate properties/data streams for each brand. Measure search visibility, visits, quote starts, successfully saved requests, qualified requests, quotes issued and won revenue as distinct stages. `generate_lead` is emitted only after the database insert succeeds; it is not a sale. Downstream qualification and revenue require an explicit CRM/admin process, not fabricated browser events.

The current implementation measures known AI referrals but does not attribute every AI-assisted visit: referrers can be absent and zero-click visibility is not a session. The Search Console generative AI report supplies a separate impression view. Configure GA4 enhanced measurement and retention deliberately in the account; custom event filtering is not a complete audit of third-party account configuration.

Prioritize decisions with actual data: improve pages with impressions but weak engagement, fix quote steps with abandonment, expand topics that produce qualified requests, and consolidate overlapping pages. Do not manufacture local doorway inventories or third-party mentions.

## Primary references checked on 6 October 2026

- [Google: optimizing for generative AI Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — technical eligibility, useful original content, reduced duplication and current Search Console controls. It explicitly says no special AI text file or chunking tactic is required.
- [Google: Generative AI performance report](https://support.google.com/webmasters/answer/16984139) — AI Overviews/AI Mode impressions and reporting dimensions; the page states worldwide rollout on 31 August 2026.
- [OpenAI: crawler documentation](https://developers.openai.com/api/docs/bots) — OAI-SearchBot discovery and separate GPTBot controls.
- [IndexNow protocol](https://www.indexnow.org/documentation) — ownership verification, batch limits, response codes and change notifications.

These are documented platform practices, not claims to possess private strategies of large companies.
