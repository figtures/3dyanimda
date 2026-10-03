# Originality and SEO/GEO implementation status — 2026-10-03

## Release decision: BLOCKED

This repository is a development preview, not an approved original-content release.
The global audit currently fails: 104 repeated paragraph groups, 540 similar text
pairs, and 6 reused asset groups among 136 published demo records plus 4 home asset
allocations. These counts describe the checked inventory, not every rendered page.
The new Supabase project has zero published landing pages. No production release
certificate has been issued. Existing private preview content is not approved copy.

## Applied database work

Project: zdxjmhhjuomcpdtllnuq. Four active brand tenants, 197 landing records each.
All 788 records are drafts. Twelve service records were replaced with individually
authored drafts; their illustrations remain empty pending original artwork. The
other 776 records still need editorial work; retaining them as drafts preserves
route planning without misrepresenting them as completed original content.

The server rejects published landing pages, CMS pages and blog posts without a
matching review fingerprint. Browser roles cannot issue certificates. Editing a
published row invalidates its approval; changing CMS blocks revokes parent approval
and returns the page to draft. Dynamic route templates are disabled. Public assets
have a registry with unique binary/geometry hashes and perceptual similarity checks.
The registry has not been populated or approved yet.

## Audit scope and limits

- Text: normalized paragraphs and five-word shingles across all supplied brands;
  brand/place substitutions are normalized. Exact repeated paragraphs within the
  same page are also blocked. This is a conservative lexical detector, not proof
  of semantic originality or a web-wide plagiarism search.
- Images: byte identity and perceptual comparison with resize/re-encoding,
  mirrored/rotated/cropped variants. Unsupported formats require review.
- GLB: geometry fingerprints after centering/scaling/PCA plus shape descriptors.
  New robot-gripper, assembly-nest and drill-gauge models replace the three shared
  industrial examples. Twelve models now have exclusive brand allocations.
  Similarity detection cannot prove uniqueness under every remesh or transformation.
- The current automated inventory does not include all rendered homepage, hub,
  theme, CMS and tool copy. Full rendered-page review is still mandatory.
- No algorithm can promise zero Google penalties or guarantee GEO visibility.
  Navigation labels, factual service terms and necessary interface text are not
  interchangeable with duplicated editorial pages. Rewording every button is not
  evidence of originality.

`npm run release:preflight` and `npm run export:sites` fail on the current package.
After the automatic audit passes, an evidence-bearing human review bound to the
complete source/public/content hash is still required. There is no bypass flag.
A build alone is a development build and does not confer publication approval.

## SEO/GEO parity review

| Source strategy | Current implementation | Remaining work |
| --- | --- | --- |
| Tenant canonical URL, title and description | Tenant-aware Seo component and overrides | Register/verify actual canonical domains; production crawl |
| Open Graph, Twitter and keywords | Supported; CMS keyword interpolation restored | Unique page-level fields and exclusive artwork for every route |
| Dynamic CMS JSON-LD | Context interpolation restored; source identity filtered | Audit each stored schema and rendered theme |
| Organization and ProfessionalService | Stable tenant entity IDs and verified identity fields | Confirm actual phone, exact address, coordinates, hours, logo and social profiles |
| Service | Tenant provider references | Validate real service scope; do not copy unsupported offers or availability |
| FAQPage | Visible FAQ data and interpolated CMS blocks | Original questions/answers per approved page |
| BreadcrumbList | Content hierarchy schema | Crawl route hierarchy in final exports |
| Article | Guide headline, organization, known modification date | Verify authorship/editorial responsibility and article images |
| Geographic metadata | Region/place per content; coordinates only if provided | Local evidence and exact business coordinates |
| Sitemap exclusions and tools | Code includes tools/sectors and respects exclusions | Edge function deployment and approved-only sitemap check |
| Location landing pages | Drafts; generic production region fallback removed | Individual local evidence and useful original content, not place substitutions |
| HTML export | Existing exporter plus fail-closed originality preflight | Final full-site rendered audit, deployment and HTTP status verification |

Source-company contact details, coordinates, hours and unsupported service promises
must not be copied. Omitting an unverified claim is intentional, not lost SEO data.
No new edge function has been deployed and no business-domain DNS has been changed.
No full SEO/GEO parity claim is made until the remaining checks are complete.

## Required before publication

1. Rewrite every remaining editorial page and unique homepage/hub/tool context.
2. Produce exclusive artwork with provenance and visual review; register its hashes.
3. Inspect all 12 models visually and register their ownership/fingerprints.
4. For each location, collect genuine local use cases, relevant operational details
   and sources. Hold pages with no useful distinguishing information as drafts.
5. Audit all four brands in all three themes, including metadata, image alt text,
   related-content cards, CMS expansions and all indexable route combinations.
6. Validate live database snapshot and asset manifest together before issuing
   server-side certificates. The certificate issuer workflow is not implemented yet.
7. Deploy edge functions, configure canonical hosts, and verify production HTTP
   statuses, robots, sitemap, JSON-LD and private-data isolation.

## Verification completed

- 15 TypeScript unit tests passed; type checking passed.
- Five originality detector regression tests passed.
- Fresh PostgreSQL-compatible migration/RLS suite passed, including missing-review,
  browser self-approval and stale-review rejection, and service draft quarantine.
- Automated full demo inventory correctly failed rather than accepting duplicates.
