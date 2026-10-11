# Answer-unit contract 1.0.0

Implementation: `src/content/answer-unit.ts`; CMS persistence: optional `editorial.answerUnit` in the existing JSON field. Existing content is not automatically marked reviewed or migrated. All 796 effective authored records currently lack this new contract, so full GEO-04 acceptance remains blocked.

The typed contract records stable answer-unit ID, canonical owner URL, Turkish locale, intent/question/direct answer, contextual limits, claim IDs/type/risk/validity, sources with publisher/tier/dates/license/locator, claim-source mappings, evidence level, author/reviewer, schema references, relationships, status and last actual review date.

Draft and review records may explicitly use null review fields. Approved/published records require review data; high/regulated risk, including an individual high-risk claim, requires a distinct human reviewer. Structural validation never proves that the named person performed a review, owns rights, or verified the claim. Independent evidence is still required.

Duplicate claim/source IDs, orphan mappings, missing support for factual/numeric/critical claims, reversed validity dates and credential-bearing URLs fail validation. Registry checks additionally accept an explicit audit time and indexable URL/entity/schema registries; duplicate answer IDs, orphan relationships, future reviews and expired claims are errors. Automatic source accessibility, source truth, conflict adjudication, reviewed intent ownership, SLA policies and source-license verification remain separate operations.

The CMS accepts the optional contract without stripping its fields. Publishing a supplied unit requires its visible answer, page path and tenant brand to match, approved/published status and unexpired claims. These are frontend checks; direct database writers must run equivalent validation. No new database constraint or existing publication status was silently applied.

Migration is intentionally evidence-driven: enter actual authors/reviewers and sources, map each claim, resolve registry references, perform required review, then publish. Do not fill missing facts with generated approvals. Existing reviewed_at values are not automatically converted to independent reviewer sign-offs.
