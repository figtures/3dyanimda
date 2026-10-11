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
