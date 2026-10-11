# Structured-data contract v1

Implementation: `src/lib/schema-graph.ts`, exported `SCHEMA_CONTRACT_VERSION = 1` and `SCHEMA_TYPE_IDS`. This is the generator contract version, not a claim of Schema.org certification or rich-result eligibility.

| Input and generator | Output contract | Verification |
| --- | --- | --- |
| Tenant identity → `businessGraph` in `structured-data.ts` | Organization and WebSite use canonical-origin IDs; ProfessionalService appears only when address data is supplied. Unknown contact, coordinates and hours are omitted. | `structured-data.test.ts` |
| Page metadata → `pageGraph` in `search.ts` | Canonical page URL and publisher identity; no invented modification date. | `search.test.ts` |
| Page schemas → `composeSchemaGraph` | One sorted graph. Organization, WebSite and ProfessionalService IDs are origin-scoped; page, article, service, FAQ, breadcrumb, list, blog and application IDs are route-scoped. | `schema-graph.test.ts` |
| Repeated stable ID | Complementary properties merge; contradictory values or types fail. | `schema-graph.test.ts`, `identity-graph.test.mjs` |
| Authored dates and source notes | Date changes track meaningful edits, not a status/review-only save. | `metadata.test.ts`, `semantic-date.test.mjs` |
| Site metadata assembly → `src/components/site/Seo.tsx` | Combines business/page/route graphs and escapes `<` during serialization. | Source inspection; current browser/render parity still pending. |

`seo-schema.ts` supplies typed service, FAQ, breadcrumb and article generators. Required facts must originate in the supplied content; this type map alone does not validate every Schema.org property or prove a source fact true. External vocabulary validation, supported Google Rich Results checks, visible FAQ parity, legal-entity confirmation and human approval remain separate requirements.

## 2026-10-11 change record

- Made the existing type-to-ID map explicit, immutable and versioned. Existing legitimate IDs are unchanged.
- Replaced truthy property lookup with an own-property check. Invalid names inherited from JavaScript objects (`constructor`, `toString`, `__proto__`) can no longer pass as registered schema types.
- Added negative regression cases alongside existing conflict and order-independence coverage.
- Local tests passed as recorded in `../audits/search-local-verification-2026-10-11.json`. This record is not independent approval of RFC-SEARCH-001 or a production validation certificate.

## Fresh Notion reconciliation — 2026-10-11

`DATA_CONTRACT_VERSION = '1.0.0'` identifies the current input contract and `SCHEMA_TEMPLATE_VERSION = '1.0.1'` identifies this output-ordering patch. Numeric `SCHEMA_CONTRACT_VERSION = 1` remains for compatibility. These are application metadata, not invented Schema.org properties.

Graph order is WebSite, Organization, page, other registered nodes, BreadcrumbList, with stable ID ties. Recursive object keys and IDs use locale-independent string comparison. Meaningful arrays preserve source order. Byte-equality fixtures cover reversed document/property order and complementary identity merging; FAQ order has a separate regression. Comprehensive source-field maps, dangling references and external vocabulary/DOM validation remain open.

The optional discovery directory limits labels to 120 Unicode code points, 80 links and 50 KiB. Its displayed update date is the latest supplied content date among included pages, omitted when unknown; it is not a review-date claim. The editorial input guard caps direct answers at 120 whitespace-separated words, excludes private related paths and credentials in HTTPS source URLs. Existing stricter table limits remain unchanged. These guards do not implement the entire GEO-04 answer-unit/claim-source contract.

## Field ownership and rendered checks

| Public source | Visible field | Structured field | Missing/invalid behavior |
| --- | --- | --- | --- |
| Tenant name and canonical domain | Brand navigation/footer | Organization/WebSite name, URL and scoped IDs | No unrelated brand identity substitution |
| verified_business_identity.email / telephone | Contact information | Organization contactPoint | Omit unknown values |
| verified_business_identity.address / geo / hours | Verified workshop facts | ProfessionalService address/geo/hours | No synthetic branch or guessed coordinates/hours |
| landing_pages.title / summary | H1 and introductory paragraph | WebPage name/description; Service name/description; Article headline/description | Preserve full authored summary in metadata |
| landing_pages.faq[].q / a | Visible FAQ content | Question / acceptedAnswer | Render audit rejects missing or invisible FAQ text |
| updated_at plus meaningful dated source-note revision | Dated content label | WebPage/Article dateModified | No build-clock freshness |
| Route hierarchy | Breadcrumb navigation | BreadcrumbList positions and items | Ordered sequence required |
| Canonical host and route | Page URL and share target | WebPage @id and internal references | Render audit checks canonical/OG parity and dangling local fragment references |

The CI candidate-render check uses `scripts/quality/schema-integrity.mjs` and verifies one H1, canonical/OG parity, one graph, unique root IDs, resolved internal fragment references, visible FAQ text and valid dates. This checks sampled candidate HTML and is not Schema.org vocabulary certification, a Google Rich Results approval or a production crawl. The full source contract and human truth verification remain separate from these structural checks.

## Template 1.1.0 — 12 October 2026

`src/content/structured-content.ts` now owns the content-to-schema mapping and the visible breadcrumb/source list. Article bylines, citations, FAQ answers, service types and geographical service areas derive from those same displayed fields. Every Question has a stable page-scoped ID. `WebPage.mainEntity`, `breadcrumb`, `hasPart`, article `isPartOf` and FAQ `about` connect the entities. Service-area pages describe a Service in an area; they do not invent a local branch. Invalid optional identity URLs, email or coordinates are omitted. Unknown prices, ratings, review counts, publication dates, certifications and business facts are never generated.

The application emits one inline JSON-LD graph per page. An external `.jsonld` download is not required for crawlers to consume it. TypeScript source is dynamic; changing a published content record changes the generated graph on the next render/export. Static deployment artifacts must be rebuilt and republished after content changes.

`scripts/quality/schema-vocabulary.json` is a compact snapshot of 34 used Schema.org types and their inherited property domains, extracted from the official HTTPS vocabulary. The snapshot records the source URL and SHA-256 of the downloaded vocabulary. `schema-vocabulary.mjs` validates nested nodes as well as graph nodes, including negative tests for unknown types and properties on the wrong type. It does not validate every property's range, certify factual truth or replace a Google-supported rich-result check.

All 796 effective authored content records are tested by `structured-content.test.ts`; authored records include drafts and this is not a count of public URLs. The independent `live-schema-inventory.ts` read-only job reads published rows from the public API, validates graphs and duplicate metadata, and records its actual coverage. The production exporter now rejects invalid graphs before writing HTML. Rendered candidate tests additionally compare visible FAQ text and canonical URLs. Production DNS, HTML and search-engine processing remain separate gates.

Google removed FAQ rich-result display on 7 May 2026 and removed its FAQ documentation in June. FAQPage remains valid Schema.org semantics when it matches visible questions, but this implementation makes no Google FAQ rich-result promise. Source: https://developers.google.com/search/updates
