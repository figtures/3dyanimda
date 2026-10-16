# Four-brand security hardening — 16 October 2026

Scope: 3dyanimda, 3dsanayi, maketyanimda, parcayanimda; shared source and Supabase project.

## Changes

- Every CMS, blog and legal-document HTML rendering boundary uses a shared DOMPurify allow list. It runs in browser and static rendering. Executable markup, event attributes, inline CSS, forms, SVG/MathML and DOM-clobbering attributes are removed. Rich text, tables, links and existing embedded raster images remain supported.
- Replaced unpatched Quill with Tiptap. Headings, bold/italic/underline/strike, lists, quotes, code, links, images and formatting reset remain available; input, paste and saved output are sanitized.
- Production Workers add CSP, DENY framing, nosniff, HSTS, Permissions-Policy and private-route no-referrer/no-store headers. CSP permits neither inline scripts/event handlers nor eval. Inline styles remain necessary for the existing React motion/theme system. Stylesheet activation uses an external script with a no-JavaScript fallback.
- Updated vulnerable dependencies and lockfile. Tailwind moved to v4 because the old chain depended on unpatched braces; Vite 6.4.4 and Vitest 4.1.12 retain the established build/test model. Kept the current themes and added compatibility utilities for outline and shadow sizing.
- Supabase bucket size/MIME restrictions: models 20 MiB, career attachments 15 MiB, public images 10 MiB. RLS restricts public image extensions. Private bucket access remains private.
- Database-enforced upload quotas per brand/bucket: 60/hour, 300/day, with byte-budget checks. Form quotas per brand/form: 100/hour, 500/day, 5/hour per normalized email. Advisory transaction locks serialize competing checks. Public submissions receive server timestamps and cannot supply internal admin notes. Limits apply to direct Data/Storage API clients, not just the UI.
- CI runs dependency audit, database regressions, HTML/CSP tests and existing multi-brand/theme navigation checks.

## Verification

- npm audit: 0 known vulnerabilities after the updated lockfile.
- TypeScript, unit tests and local contract tests passed during implementation.
- PostgreSQL harness verified valid submissions/uploads, quota rejection, forged-timestamp rejection, extension rejection and unchanged tenant isolation.
- Live migration applied; bucket constraints, restrictive policy and five form triggers read back successfully. No customer data deleted.

## Limits / remaining action

- Supabase organization is on the Free plan. Native leaked-password protection requires Pro or above. No paid upgrade was made; the native setting remains disabled. It must be enabled in Auth > Email after an authorized plan upgrade. Client-only checks are not a replacement for Auth enforcement.
- MIME restrictions validate the declared type; they are not antivirus scanning or full binary/CAD parsing. Quotas bound abuse but cannot guarantee prevention of distributed denial of service.
- Browser visual checks run in GitHub CI; the current managed workspace has no supported control-browser capability. Check the final commit's CI and Cloudflare deployments before considering every live domain updated.
- Zero advisory matches is a dated dependency result, not a guarantee of zero security vulnerabilities.

## Quote flow and pricing follow-up

- All four brands and all four themes share the new three-step quote flow, persistent request summary, accessible file chooser and optional project-detail disclosure. No contact or engineering field was removed.
- Verified database: each new brand has 20 materials, zero instant-price-ready materials, no pricing_settings and no campaigns. Existing reference tenant data was not copied into the commercial brands.
- Admin Pricing now creates missing tenant-specific settings, validates inputs, and previews the same estimate engine using editable volume, quantity and quality. Material prices remain for the owner to set; no invented live prices or promotions were published.
- Admin Campaigns now scopes reads/writes to the current tenant, validates discount limits, links pricing setup, and describes the actual preview-discount behavior. The old countdown claim had no implementation and was removed; no server-enforced timed promotion is claimed.
- Campaign badge/message, eligibility and discount are shown in the quote estimate. Default infill now uses the admin setting.
- Local unit suite: 146 tests pass. TypeScript passes. Added remote browser coverage for 4 brands × 4 themes × 2 viewport widths, retaining inputs across steps and checking overflow. Local browser QA unavailable under the managed Sites workflow; remote job status must be checked separately.
