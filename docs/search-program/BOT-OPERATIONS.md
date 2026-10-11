# Crawler policy and operations

Checked 2026-10-10 against source `8d5a169`. This is a documentation baseline for the four brands. The [registry](bot-registry.json) records current official references, verification methods and unresolved evidence. No robots, WAF, origin, rate limit or deployment policy was changed. Production checks and purpose approvals are still `null`; a checked reference is not proof of live crawler access.

## Existing policy

The generated production file in `scripts/search/discovery.mjs` has one `User-agent: *` group, allows `/`, and disallows `/admin`, `/studio`, `/api/` and `/auth/`. Every registry entry retains that policy. No training opt-out or vendor-specific exception is implied by documenting a vendor. `public/robots.txt` is a smaller fallback with only `/admin` and `/studio`; test the generated artifact and the eventual deployed response. Preview mode in `deploy/worker.mjs` remains `Disallow: /` with `noindex`.

Robots rules are crawl preferences, not access authorization. Source IP verification identifies an operator; it does not grant permission. User-triggered retrieval is a separate behavior whose robots handling varies by vendor. Authentication, private storage, application authorization and normal abuse protection remain necessary regardless of robots or bot identity. See [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html).

## Purpose matrix

All rows retain public access under the existing wildcard policy and its path exclusions. “Pending” identifies a source gap, not a new block.

| Token | Purpose | Control or verification distinction |
| --- | --- | --- |
| Googlebot | Google Search | Verify Google's common-crawler IP feed or forward-confirmed reverse DNS. |
| Google-Extended | Gemini training and specified grounding | Product token only; no separate HTTP agent. Does not govern Google Search inclusion or ranking. |
| OAI-SearchBot | ChatGPT search | Separate from the training control; use its own IP feed. |
| GPTBot | Potential training collection | Independent purpose decision; use its own IP feed. |
| ChatGPT-User | User-triggered access | Robots may not apply; not a Search inclusion control. Feed URL documented, retrieval unsuccessful here. |
| Claude-SearchBot | Search quality/indexing | Match token and current Anthropic IP feed. |
| ClaudeBot | Potential training collection | Separate purpose from search. |
| Claude-User | User-triggered access | Anthropic documents robots compliance for its bots, including this token. |
| PerplexityBot | Search discovery | Not foundation-model training; use its feed. |
| Perplexity-User | User-triggered access | Vendor says robots is generally ignored; use the separate feed. |
| facebookexternalhit | Social preview candidate | Pending: Meta's official crawler page returned 429. Current behavior/IP verification not certified. |
| LinkedInBot | Social preview candidate | OGP sharing requirements verified; preview-specific token/IP mapping and robots handling pending. |
| Twitterbot | X card candidate | Pending: official legacy Cards URLs redirect to generic docs. |

Primary sources: [Google controls](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers), [Google verification](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests), [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers), [LinkedIn sharing](https://www.linkedin.com/help/linkedin/answer/a521928). Failed or redirected official references are retained in the registry. Do not replace missing verification with unofficial crawler directories, guessed IP ranges, or assumptions that every Meta token has the same purpose.

## Tests and required evidence

Run existing local regression tests:

```sh
node --test scripts/search/discovery.test.mjs scripts/cloudflare/config.test.mjs
```

These test local behavior. They do not demonstrate an authentic vendor visit. For every declared token and an unknown token, check the generated policy against this exact boundary matrix before changing rules:

| Paths | Existing generated robots result |
| --- | --- |
| `/`, `/rehber/example`, `/assets/example.js`, `/images/example.jpg` | Allow |
| `/admin`, `/admin/settings`, `/administrator` | Disallow |
| `/studio`, `/studio/example`, `/studio-old` | Disallow |
| `/api/`, `/api/example`, `/auth/`, `/auth/example` | Disallow |
| `/api`, `/auth` | Allow by the current robots text; the discovery inventory rejects these private roots separately |

The last row records current behavior, not an instruction to expose private content. Prefix rules are case-sensitive by path. Any future parser fixtures should cover case-insensitive token matching, wildcard fallback, duplicate matching groups, longest path match, equal-length allow/disallow, comments, UTF-8/percent encoding and empty rules. Keep fixture expectations tied to RFC 9309 and vendor-specific documented differences.

Before claiming production verification, retain timestamped evidence per canonical host:

1. Retrieve `/robots.txt`, a representative public HTML page, its CSS/JS and its social image from at least two regions. Record status, content type, response hash, cache headers, canonical, robots meta/header and redirects. Compare the deployed artifact hash and intended host policy.
2. Test an untrusted request with each candidate user agent. Label this a **synthetic response test**, never a verified bot. Confirm a spoofed token gains no authentication or private-route bypass. Check edge versus origin responses using authorized infrastructure access.
3. For real traffic, use trusted edge source-IP fields, current official CIDRs and the token; for Google the documented DNS method is an alternative. Record identity method/feed hash, path category, status, edge action, latency and timestamp. Retain no request secrets. Keep unverified requests separate from verified vendor metrics.
4. Validate actual social previews when an authorized operator can use the vendor tool. Successful local metadata extraction alone is insufficient. Capture the visible preview and page/image fetch errors.

Rates, 403/429/5xx baselines, region parity, live previews, bot samples and WAF spoof resistance remain unmeasured. Do not enter invented zero-error baselines. Maintain separate counters for search, training, user-triggered and social purposes; Google-Extended cannot have its own HTTP hit counter.

## Change and incident process

Assign a named operational owner and backup before activating monitoring; both remain `null`. Review the primary references and IP feeds before a rule change and on a recurring review date chosen by that owner. Record failures and retain the last valid verified feed; an empty or unavailable feed must not silently create a broad allow rule. Classify documentation changes by purpose and review their consequences before changing policy.

For a crawl/preview outage or traffic surge, preserve a redacted sample and configuration hash, establish whether identity is verified, and locate the failing layer: robots, DNS/TLS, CDN challenge, origin response, authentication, resource availability or metadata. Compare affected and unaffected paths/regions. Restore the last known-good configuration for a confirmed regression, or use a narrowly scoped temporary mitigation for the demonstrated load. Do not replace an incident fix with a global training/search policy change or user-agent-only bypass.

For any proposed edge/policy change, prepare the exact diff, affected purpose/path matrix, test evidence, expiry and rollback command. Record the required business/security decision; unknown approval remains `null`. Suggested rehearsal checkpoints are T+0 snapshot, T+5 minutes canary, T+15 minutes rollback decision and T+24 hours cache/propagation recheck. These are proposed checkpoints, not an approved SLA or completed observations. Do not certify resolution until the failed request class and public resource checks pass again. Document remaining source and production gaps explicitly.
