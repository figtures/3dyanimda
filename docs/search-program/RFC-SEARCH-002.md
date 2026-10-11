# RFC-SEARCH-002 — Current Notion contract reconciliation

Status: implemented and locally tested for owner-private preview; not an independently approved business-domain release.

Date: 2026-10-11. Author: Codex, owner-delegated AI. Required independent sign-offs, review-window evidence and distinct backups are absent; no names or approvals are inferred.

## Problem and scope

Current Notion GEO-04/GEO-06 requirements exposed three implementation gaps: 160-character discovery labels exceeded the 120-character contract, equivalent schema inputs could serialize differently, and direct answers had only a character limit. The change narrows these gaps without rewriting any of the 796 effective authored content records.

## Change and alternatives

- Limit optional llms labels to 120 Unicode code points and display only an included-source content date. Omitting the optional directory remains valid; no ranking benefit is asserted.
- Separate input/template semantic versions, order graph nodes, and recursively canonicalize object keys. Do not sort semantic FAQ/breadcrumb arrays.
- Enforce the 120-word direct-answer maximum and disallow private related links or credentials in source links. Automatic truncation was rejected because it could remove qualifications from content.
- Reconcile current source references and stale blocker descriptions; retain historical reports as historical.

Existing URLs, canonical policy, robots access decisions, social assets and fixed owner inbox remain unchanged. This change does not approve business-domain launch.

## Evidence and risks

See `../audits/notion-reconciliation-2026-10-11.json` and the current evidence index. Local regression coverage includes all 796 effective editorial records, exact JSON serialization, negative links and discovery bounds. Current rendered browser parity, full source-field contract, expert review and live CDN headers remain open. New invalid CMS inputs are rejected; editors may need to move detail from the direct answer into supporting sections.

The separate previously successful CI run belongs to commit `2640f0bd247a5034e4fd19ed0b9ec376fda475ba`; it is not used as proof for this patch.

## Rollback plan — not an executed drill

Last deployed private Sites source before this patch: `7e06466edaf900023bf5c0d8097123e106b3e82f`; GitHub baseline: `2640f0bd247a5034e4fd19ed0b9ec376fda475ba`. Revert this patch as a new source revision and rebuild/deploy to the same owner-private audience. No content/database migration is needed. Validate at least ten representative routes across all four brands, including home, service, guide, quote and contact, and compare canonical, visible text and structured data. An actual measured rollback and its RTO are still required before treating this plan as drill evidence.
