# Originality and SEO/GEO implementation status — 2026-10-06

## Current status — 6 October 2026

The automatic global audit now **passes** for all 144 preview content pages plus
four homepage asset allocations. The inherited duplicate findings are resolved
without changing detector thresholds. Twelve service pages and eight new buyer
guides are complemented by 124 individually rewritten legacy articles. Existing
paths are preserved. A separate generated product-prototype hero replaces the
shared 3dyanimda image; its provenance is recorded alongside the service artwork.

The two October 6 migrations are now applied to the existing remote database.
Live verification at 2026-10-06 17:30 UTC confirms all 144 authored routes match
the committed content and both migration source fingerprints match. Each brand
has 199 draft records, including 36 authored routes: 796 drafts in total, zero
published rows. The other 652 planning records remain drafts. RLS remains enabled.
Local regression tests also confirm that owner-edited rows are preserved.
The source-bound human release review, asset registry approval and production
hosting configuration are still required. No certificate has been fabricated.

See `SEARCH-GROWTH-2026-10.md`, `global-originality.json` and
`rendered-editorial.json` for current implementation and automated evidence.
The entries below are historical checkpoints, not the current duplicate counts.

## Historical checkpoint — 3 October 2026

## Release decision: BLOCKED

This repository is a development preview, not an approved original-content release.
The global audit currently fails: 87 repeated paragraph groups, 522 similar text
pairs, and 3 reused asset groups among 136 published demo records plus 4 home asset
allocations. These counts describe the checked inventory, not every rendered page.
The new Supabase project has zero published landing pages. No production release
certificate has been issued. Existing private preview content is not approved copy.

## Applied database work

Project: zdxjmhhjuomcpdtllnuq. Four active brand tenants, 197 landing records each.
All 788 records are drafts. Twelve service records were replaced with individually
authored drafts; their 12 exclusive illustrations are now committed locally; the new artwork migration has not been applied to the remote project. The
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

- 22 TypeScript/component tests passed; type checking passed.
- Five originality detector regression tests passed.
- Fresh PostgreSQL-compatible migration/RLS suite passed, including missing-review,
  browser self-approval and stale-review rejection, and service draft quarantine.
- Automated full demo inventory correctly failed rather than accepting duplicates.

## 2026-10-04 service artwork and admin entry update

Twelve independently generated concept images are stored in public/brand/services/.
The prompt subjects and provenance are in content/authoring/service-artwork.json.
The built-in image_gen tool was used; WebP encoding preserves the generated scene.
Each image is allocated to exactly one brand/service detail. Homepage service cards
no longer reuse shared stock photographs or those service detail illustrations.
The 12 authored service drafts and their images pass the lexical/perceptual audit
as a group. This does not approve the remaining inventory or claim web-wide uniqueness.

The admin entry identifies the resolved tenant, includes accessible field labels,
password visibility, offline-preview blocking, network error recovery and an account
switch option for unauthorized sessions. Seven component tests exercise these states.
No administrator account was created or invited. Real account login for the four
production domains has not been verified; domain registration and owner membership
are still required. Existing RLS tests pass; they are not a substitute for live login.

The new migration 20261004200000_exclusive_service_artwork.sql is committed but
has NOT been applied remotely. The local preview seed contains the new service copy
and illustrations. The private hosted preview has NOT been republished this turn.

Chromium installation returned a truncated/non-ZIP archive in this environment.
No new browser screenshot/responsive audit was completed. Do not mark these visual
changes production-ready until browser verification and full release review succeed.

## 2026-10-04 deployment and owner provisioning update

All 34 repository migrations are now applied to project zdxjmhhjuomcpdtllnuq,
including the exclusive-service-artwork migration. Canonical tenant domains are
registered as <brand>.com and their aliases are synchronized by the existing trigger.
No Cloudflare DNS or production Worker deployment was performed.

The requested info@3dyanimda.com user was created and granted active owner membership
in all four brand tenants. Password authentication and tenant resolution were tested
against the real Supabase Auth/REST APIs; all four owner checks passed. This is not a
claim that the business-domain frontends are deployed. No email invitation was sent.
Initial credentials were not committed or stored in repository files.

The navigation was rebuilt using accessible Popover/Sheet primitives: direct service
links, a grouped desktop directory, mobile focus management, Escape dismissal,
route-change dismissal, scrollable mobile contents and a persistent quote action.
48 brand/theme/viewport browser cases passed at widths 320, 390, 768 and 1440, including
service artwork loading and horizontal overflow checks. Menu screenshots were
visually inspected. The prior Chromium blocker was resolved using a compatible
packaged Chromium build. 22 component/unit tests also passed.

The private design demo was republished successfully with source commit
f38c758f150ad96b6d6c69d2a18e19bbbfbcfe85, deployment
appgdep_6ac2a4dc71908191b39a1793ab5578ad. It intentionally remains offline/read-only;
production owner login is not offered by the design preview.

Remaining blockers still apply: full original editorial inventory, publication-review
UI/issuer, production domain hosting and remaining integration verification. There
are zero published landing rows. Do not describe the entire project as complete.
